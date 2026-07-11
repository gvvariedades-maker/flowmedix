#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g03 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g03
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g03 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g03';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-09';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'consultas pré-natal',
    'sofrimento fetal',
    'líquido amniótico',
    'gravidez anembrionária',
    'gestante hipertensa',
    'atribuições técnico enfermagem',
  ],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — Planejamento familiar',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: ['planejamento familiar', 'métodos contraceptivos', 'direitos reprodutivos'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  sources?: (typeof AB32_SOURCE | typeof PF_SOURCE)[];
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-semiologia-em-enfermagem-1779563491765-0': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'MS/FEGO — vitalidade fetal: cardiotocografia, mecônio, movimentos fetais',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sofrimento fetal — pré-hospitalar',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Cinco afirmativas (I–V) — julgar cada uma antes de combinar letras.', icon: 'Target' },
          { label: 'Padrão sinusoidal (I)', detail: 'Achado grave na cardiotocografia — não indica bem-estar fetal.', icon: 'Activity' },
          { label: 'Mecônio (II)', detail: 'Pode ser fisiológico ou patológico — depende de IG e contexto clínico.', icon: 'Droplets' },
          { label: 'Taquicardia + variabilidade (III)', detail: 'Taquicardia persistente com variabilidade reduzida sugere hipoxemia.', icon: 'Heart' },
          { label: 'Movimentos fetais (V)', detail: 'Redução percebida pela gestante é sinal de alerta para hipoxia.', icon: 'Baby' },
          { label: 'Pegadinha sinusoidal', detail: 'Absolutismo “sinusoidal = bem-estar” invalida I — pegadinha clássica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'III e V verdadeiras — I, II e IV falsas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Vitalidade fetal — sinais',
        meta: slideMeta,
        content: 'SOFRIMENTO FETAL',
        rows: [
          { label: 'Padrão sinusoidal', value: 'Alerta grave — não é tranquilizador', badge: 'hot', emphasis: 'highlight' },
          { label: 'Mecônio', value: 'Interpretar conforme IG e quadro materno-fetal', badge: 'warn' },
          { label: 'Taquicardia + baixa variabilidade', value: 'Sugestivo de hipoxemia progressiva', badge: 'hot' },
          { label: 'Movimentos fetais', value: 'Redução = sinal de alerta', badge: 'info' },
          { label: 'Hipoxemia severa', value: 'Não resolve só com mudança de decúbito', badge: 'warn' },
        ],
        footer_rule: 'Absolutismos em I e II são falsos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I a V antes de combinar.',
          'Julgar I: padrão sinusoidal = grave, não bem-estar → FALSA.',
          'Julgar II: mecônio nem sempre fisiológico → FALSA.',
          'Julgar III: taquicardia + variabilidade reduzida → VERDADEIRA.',
          'Julgar IV: hipoxemia severa não melhora só com decúbito → FALSA.',
          'Julgar V: redução de movimentos fetais = alerta → VERDADEIRA.',
          'Conjunto correto: III e V.',
          'Eliminar A (I,II), B (III,IV), C (II,IV).',
          'Marcar letra D — III e V.',
        ],
        footer_rule: 'III+V → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO V/F',
        items: [
          { label: 'Letra A — I e II', detail: 'Inclui sinusoidal como bem-estar e mecônio sempre fisiológico.', correct: 'I e II são falsas — padrão sinusoidal é grave.' },
          { label: 'Letra B — III e IV', detail: 'Inclui IV falsa sobre hipoxemia severa.', correct: 'IV é falsa — hipoxemia severa exige intervenção, não só decúbito.' },
          { label: 'Letra C — II e IV', detail: 'Combina dois absolutismos falsos.', correct: 'III e V são as verdadeiras — mecônio contextual e movimentos reduzidos.' },
          { label: 'Confundir sinusoidal com normal', detail: 'Aluno não reconhece padrão sinusoidal como emergência.', correct: 'Sinusoidal na cardiotocografia indica sofrimento — I é falsa.' },
        ],
        footer_rule: 'Sinusoidal ≠ bem-estar — III+V',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'agirh-enfermagem-saude-da-mulher-1777104306781-1': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 — mínimo de 6 consultas de pré-natal de baixo risco',
    roi_error: 'prenatal_consultas_4',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-natal — consultas mínimas',
        meta: slideMeta,
        items: [
          { label: 'Comando MS', detail: 'Número mínimo de consultas no pré-natal de baixo risco.', icon: 'Target' },
          { label: 'Parâmetro atual', detail: 'Mínimo de 6 consultas distribuídas na gestação.', icon: 'Calendar' },
          { label: 'Pegadinha 4 consultas', detail: 'Modelo antigo ou confusão com periodicidade — não é o mínimo atual.', icon: 'AlertTriangle' },
          { label: 'Distribuição', detail: 'Consultas ao longo dos trimestres — não concentrar no fim.', icon: 'Clock' },
        ],
        footer_rule: 'MS atual: 6+ consultas',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — consultas',
        meta: slideMeta,
        content: 'PRÉ-NATAL DE BAIXO RISCO',
        rows: [
          { label: 'Mínimo', value: '6 consultas de pré-natal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Pegadinha 4', value: 'Número desatualizado — não é o mínimo MS', badge: 'warn' },
          { label: '9 ou 10', value: 'Protocolos de alto risco — não baixo risco universal', badge: 'info' },
          { label: '1ª consulta', value: 'O mais precoce possível — exames iniciais', badge: 'info' },
        ],
        footer_rule: '6 consultas = parâmetro MS baixo risco',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar parâmetro normativo do MS para baixo risco.',
          'Eliminar A — três consultas: abaixo do mínimo.',
          'Testar B — seis consultas: corresponde ao Caderno AB 32.',
          'Eliminar C — nove consultas: não é o mínimo universal.',
          'Eliminar D — dez consultas: não é o mínimo universal.',
          'Marcar letra B.',
          'Fixação: 6 consultas — não confundir com 4 (desatualizado).',
        ],
        footer_rule: 'Mínimo MS → 6 consultas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÚMERO DE CONSULTAS',
        items: [
          { label: 'Letra A — três consultas', detail: 'Abaixo do mínimo do MS.', correct: 'Mínimo atual: 6 consultas de pré-natal.' },
          { label: 'Letra C — nove consultas', detail: 'Confunde com protocolo de alto risco.', correct: 'Baixo risco: mínimo 6 — letra B.' },
          { label: 'Letra D — dez consultas', detail: 'Exagera o mínimo obrigatório.', correct: 'MS define 6 consultas como piso.' },
          { label: 'Pegadinha 4 consultas', detail: 'Prova antiga ou confusão com periodicidade.', correct: 'Humanização e AB 32: 6+ consultas.' },
        ],
        footer_rule: '4 consultas = desatualizado',
      },
    ],
  },

  'amauc-enfermagem-processo-de-enfermagem-1780005128081-1': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS — planejamento familiar: autonomia, contracepção e direitos reprodutivos',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Planejamento familiar — definição',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assinalar afirmativa CORRETA sobre planejamento familiar.', icon: 'Target' },
          { label: 'Escopo amplo', detail: 'Homens e mulheres — contracepção, gravidez desejada e direito de escolha.', icon: 'Users' },
          { label: 'Pegadinha “exclusivamente”', detail: 'Distratores usam restritivo: só casais, só hormonais, só após 1ª gestação.', icon: 'AlertTriangle' },
          { label: 'Educação + clínica', detail: 'Ações educativas e clínicas — não só prescrição.', icon: 'BookOpen' },
        ],
        footer_rule: 'PF ≠ método único nem só mulher',
      },
      {
        type: 'golden_rule',
        slide_title: 'PF — eixos MS',
        meta: slideMeta,
        content: 'PLANEJAMENTO FAMILIAR',
        rows: [
          { label: 'Público', value: 'Homens e mulheres em idade fértil', badge: 'info' },
          { label: 'Contracepção', value: 'Orientar métodos e prevenir gravidez indesejada', badge: 'hot' },
          { label: 'Direito reprodutivo', value: 'Ter ou não ter filhos — autonomia', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não é', value: 'Só casal estável · só hormonal · só clínico', badge: 'warn' },
        ],
        footer_rule: 'Definição ampla — letra E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato “é CORRETO afirmar” — testar qualificadores absolutos.',
          'Eliminar A — “exclusivamente casais estáveis”.',
          'Eliminar B — “restringe-se a hormonais”.',
          'Eliminar C — “apenas após primeira gestação”.',
          'Eliminar D — “exclusivamente clínico”.',
          'Testar E — conjunto de ações para homens e mulheres, contracepção e escolha reprodutiva.',
          'Marcar letra E.',
        ],
        footer_rule: 'Definição ampla → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — QUALIFICADORES ABSOLUTOS',
        items: [
          { label: 'Letra A — só casais estáveis', detail: 'Restringe público-alvo indevidamente.', correct: 'PF abrange homens e mulheres — autonomia reprodutiva.' },
          { label: 'Letra B — só hormonais', detail: 'Ignora barreira, LARC e outros métodos.', correct: 'Conjunto amplo de métodos e orientação — letra E.' },
          { label: 'Letra C — após 1ª gestação', detail: 'Limita fecundidade a momento errado.', correct: 'PF orienta antes e durante todo o ciclo reprodutivo.' },
          { label: 'Letra D — só clínico', detail: 'Exclui educação em saúde.', correct: 'Ações educativas e clínicas integradas — letra E.' },
        ],
        footer_rule: '“Exclusivamente” = distrator',
      },
    ],
  },

  'ameosc-enfermagem-processo-de-enfermagem-1780008225255-7': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — atribuições do TE no pré-natal sem diagnóstico nem prescrição',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE no pré-natal — caso clínico',
        meta: slideMeta,
        items: [
          { label: 'Caso UBS', detail: 'Gestante 3º trimestre: edema, PA elevada, cefaleia — sinais de alerta.', icon: 'User' },
          { label: 'Papel do TE (II)', detail: 'Coletar dados, registrar e comunicar achados ao enfermeiro.', icon: 'ClipboardList' },
          { label: 'Educação (III)', detail: 'Orientar nutrição e cuidados sob supervisão do enfermeiro.', icon: 'BookOpen' },
          { label: 'Pegadinha prescrever (I)', detail: 'TE não diagnostica pré-eclâmpsia nem prescreve antihipertensivos.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE coleta e comunica — não diagnostica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Atribuições — TE × enfermeiro',
        meta: slideMeta,
        content: 'PRÉ-NATAL NA UBS',
        rows: [
          { label: 'TE — pode', value: 'Sinais vitais, registro, educação, procedimentos prescritos', badge: 'hot' },
          { label: 'TE — não pode', value: 'Diagnosticar pré-eclâmpsia nem prescrever', badge: 'warn', emphasis: 'highlight' },
          { label: 'Comunicação', value: 'Achados anormais → enfermeiro/médico', badge: 'info' },
          { label: 'Supervisão', value: 'Ações sob direcionamento do enfermeiro', badge: 'info' },
        ],
        footer_rule: 'I extrapola papel do TE',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caso: gestante com PA elevada, cefaleia e edema — avaliar atribuições do TE.',
          'Julgar I: diagnosticar e prescrever antihipertensivos → FALSA (competência médica/enfermeiro).',
          'Julgar II: coletar, registrar e comunicar → VERDADEIRA.',
          'Julgar III: orientação educativa sob supervisão → VERDADEIRA.',
          'Julgar IV: procedimentos conforme prescrição → VERDADEIRA.',
          'Conjunto: II, III e IV.',
          'Eliminar A (inclui I), B (inclui I), C (inclui I).',
          'Marcar letra D.',
        ],
        footer_rule: 'II+III+IV → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ATRIBUIÇÃO DO TE',
        items: [
          { label: 'Letra A — I, II e III', detail: 'Inclui diagnóstico e prescrição pelo TE.', correct: 'TE não diagnostica pré-eclâmpsia nem prescreve — I é falsa.' },
          { label: 'Letra B — I, III e IV', detail: 'Mantém item I incorreto.', correct: 'Coleta e comunicação sim — prescrição diagnóstica não.' },
          { label: 'Letra C — todas', detail: 'Aceita I como correta.', correct: 'I extrapola competência — só II, III e IV.' },
          { label: 'Confundir alerta com prescrever', detail: 'PA elevada não autoriza TE a prescrever.', correct: 'Comunicar achados ao enfermeiro — letra D.' },
        ],
        footer_rule: 'Alerta ≠ prescrição pelo TE',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'atame-enfermagem-saude-da-mulher-1777104347186-6': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — cuidados na gestante hipertensa: hidratação, DLE, restrição de sódio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gestante hipertensa — cuidados',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Cuidado essencial na gestante com hipertensão.', icon: 'Target' },
          { label: 'Hidratação (C)', detail: 'Água e sucos naturais — manter hidratação adequada.', icon: 'Droplets' },
          { label: 'Pegadinha sódio (A)', detail: 'Dieta rica em sódio agrava HAS — conduta incorreta.', icon: 'AlertTriangle' },
          { label: 'Pegadinha decúbito (B)', detail: 'Decúbito lateral esquerdo favorece perfusão — não o direito.', icon: 'XCircle' },
        ],
        footer_rule: 'HAS gestacional: hidratar · restringir sódio · DLE',
      },
      {
        type: 'golden_rule',
        slide_title: 'HAS na gestação',
        meta: slideMeta,
        content: 'CUIDADOS ESSENCIAIS',
        rows: [
          { label: 'Hidratação', value: 'Água e sucos naturais — adequada', badge: 'hot', emphasis: 'highlight' },
          { label: 'Sódio', value: 'Restringir — não dieta rica em sódio', badge: 'warn' },
          { label: 'Decúbito', value: 'Lateral esquerdo — melhora retorno venoso', badge: 'hot' },
          { label: 'Calçado', value: 'Confortável — não substitui cuidado essencial', badge: 'info' },
        ],
        footer_rule: 'Hidratação = cuidado essencial cobrado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: gestante hipertensa — identificar cuidado essencial.',
          'Eliminar A — dieta rica em sódio: agrava pressão arterial.',
          'Eliminar B — decúbito lateral direito: esquerdo é o recomendado.',
          'Testar C — hidratação adequada com água e sucos naturais.',
          'Eliminar D — sapato fechado: cuidado periférico, não o essencial pedido.',
          'Marcar letra C.',
        ],
        footer_rule: 'Hidratação → letra C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HAS GESTACIONAL',
        items: [
          { label: 'Letra A — sódio', detail: 'Inverte conduta dietética na HAS.', correct: 'Restringir sódio — hidratação adequada é o cuidado essencial.' },
          { label: 'Letra B — decúbito direito', detail: 'Lado errado para perfusão uteroplacentária.', correct: 'Decúbito lateral esquerdo — letra C (hidratação).' },
          { label: 'Letra D — sapatos fechados', detail: 'Cuidado com edema, não o “essencial” do enunciado.', correct: 'Hidratação adequada é o gabarito.' },
          { label: 'Confundir edema com conduta', detail: 'Foco do comando é cuidado essencial global.', correct: 'Manter hidratação — letra C.' },
        ],
        footer_rule: 'Sódio ↑ e DLD = distrator',
      },
    ],
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104261182-8': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — gravidez anembrionária: fertilização sem desenvolvimento embrionário',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gravidez anembrionária',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Óvulo fertilizado, porém embrião não se desenvolve.', icon: 'Baby' },
          { label: 'vs. Ectópica (A)', detail: 'Implantação fora do útero — outra entidade.', icon: 'XCircle' },
          { label: 'vs. Abortamento (B)', detail: 'Interrupção antes de 22 sem — conceito distinto.', icon: 'AlertCircle' },
          { label: 'Pegadinha evolutiva (E)', detail: 'Confundir com gestação normal com embrião viável.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Fertilizado sem embrião = anembrionária',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tipos — gestação inicial',
        meta: slideMeta,
        content: 'GRAVIDEZ ANEMBRIONÁRIA',
        rows: [
          { label: 'Anembrionária', value: 'Fertilização sem desenvolvimento embrionário', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ectópica', value: 'Implantação extrauterina (trompa)', badge: 'warn' },
          { label: 'Abortamento', value: 'Perda gestacional precoce — conceito distinto', badge: 'info' },
          { label: 'Evolutiva', value: 'Embrião se desenvolve normalmente', badge: 'info' },
        ],
        footer_rule: 'Saco sem embrião viável',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar definição de gravidez anembrionária.',
          'Eliminar A — ectópica: implantação fora do útero.',
          'Eliminar B — abortamento: interrupção involuntária precoce.',
          'Eliminar C — óvulo não fertilizado com embrião: contraditório.',
          'Testar D — fertilizado sem desenvolvimento embrionário.',
          'Eliminar E — gestação evolutiva normal.',
          'Marcar letra D.',
        ],
        footer_rule: 'Sem embrião → anembrionária',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÕES',
        items: [
          { label: 'Letra A — ectópica', detail: 'Implantação tubária, não anembrionária.', correct: 'Anembrionária: fertilização intrauterina sem embrião.' },
          { label: 'Letra B — abortamento', detail: 'Perda gestacional, não definição anembrionária.', correct: 'Fertilizado sem desenvolvimento embrionário — D.' },
          { label: 'Letra C — não fertilizado', detail: 'Contradiz presença de saco gestacional fertilizado.', correct: 'Há fertilização — embrião não desenvolve.' },
          { label: 'Letra E — evolutiva', detail: 'Gestação normal com embrião viável.', correct: 'Anembrionária = ausência de desenvolvimento embrionário.' },
        ],
        footer_rule: 'Ectópica × anembrionária',
      },
    ],
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104329543-0': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — líquido amniótico: funções de proteção e desenvolvimento fetal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Líquido amniótico',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Fluido que preenche o saco amniótico — funções fetais.', icon: 'Target' },
          { label: 'Líquido amniótico', detail: 'Amortecedor, proteção do cordão, desenvolvimento musculoesquelético e pulmonar.', icon: 'Droplets' },
          { label: 'Pegadinha recipiente', detail: 'Saco/bolsa amniótico = estrutura — não o fluido.', icon: 'AlertTriangle' },
          { label: 'Termo incorreto', detail: '“Suco amniótico” não é nomenclatura anatômica.', icon: 'XCircle' },
        ],
        footer_rule: 'Fluido ≠ saco amniótico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Funções — líquido amniótico',
        meta: slideMeta,
        content: 'LÍQUIDO AMNIÓTICO',
        rows: [
          { label: 'Definição', value: 'Fluido no interior do saco amniótico', badge: 'hot', emphasis: 'highlight' },
          { label: 'Proteção', value: 'Amortecimento e proteção fetal', badge: 'info' },
          { label: 'Desenvolvimento', value: 'Movimentos fetais e maturação pulmonar', badge: 'hot' },
          { label: 'Não confundir', value: 'Saco amniótico = membrana/recipiente', badge: 'warn' },
        ],
        footer_rule: 'Pergunta pede o fluido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Enunciado descreve fluido com funções de amortecimento e desenvolvimento fetal.',
          'Eliminar A — “suco amniótico”: termo incorreto.',
          'Eliminar B — saco amniótico: é a estrutura, não o fluido.',
          'Eliminar C — parede amniótica: membrana, não o fluido.',
          'Testar D — líquido amniótico.',
          'Eliminar E — bolsa amniótico: recipiente, não conteúdo.',
          'Marcar letra D.',
        ],
        footer_rule: 'Fluido → líquido amniótico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FLUIDO × ESTRUTURA',
        items: [
          { label: 'Letra A — suco amniótico', detail: 'Termo inexistente na anatomia.', correct: 'Nomenclatura correta: líquido amniótico.' },
          { label: 'Letra B — saco amniótico', detail: 'Confunde recipiente com conteúdo.', correct: 'O fluido dentro do saco é o líquido amniótico.' },
          { label: 'Letra C — parede amniótica', detail: 'Membrana, não o fluido.', correct: 'Funções descritas são do líquido — letra D.' },
          { label: 'Letra E — bolsa amniótica', detail: 'Estrutura que contém o fluido.', correct: 'Pergunta cobra o fluido — líquido amniótico.' },
        ],
        footer_rule: 'Saco ≠ líquido',
      },
    ],
    cleanInstruction: (s) =>
      cleanPdfNoise(s).replace(/cord[aã]o umbilical/gi, 'feto'),
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104329543-7': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'Caderno AB 32 (MS) — terminologia obstétrica: primípara = primeiro parto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Primípara — paridade',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Número de bebês paridos (ou a parir) por uma primípara.', icon: 'Target' },
          { label: 'Primípara', detail: 'Mulher no primeiro parto — paridade = um.', icon: 'Baby' },
          { label: 'vs. Nulípara (A)', detail: 'Zero partos — ainda não é primípara no sentido de parto concluído.', icon: 'XCircle' },
          { label: 'Pegadinha multipara', detail: 'Três ou mais partos = multiparidade — não primípara.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Primípara = 1º parto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Paridade — termos',
        meta: slideMeta,
        content: 'TERMINOLOGIA OBSTÉTRICA',
        rows: [
          { label: 'Nulípara', value: 'Nenhum parto', badge: 'info' },
          { label: 'Primípara', value: 'Primeiro parto — um bebê', badge: 'hot', emphasis: 'highlight' },
          { label: 'Multípara', value: 'Dois ou mais partos', badge: 'info' },
          { label: 'Paridade', value: 'Conta partos, não gestações apenas', badge: 'warn' },
        ],
        footer_rule: 'Primípara → um',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Definir primípara: mulher em seu primeiro parto.',
          'Eliminar A — zero: nulípara, não primípara.',
          'Testar B — um: primeiro parto.',
          'Eliminar C — três: multiparidade.',
          'Eliminar D — cinco ou mais: grande multiparidade.',
          'Eliminar E — nega relação com gestação: conceito errado.',
          'Marcar letra B.',
        ],
        footer_rule: '1º parto → um',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARIDADE',
        items: [
          { label: 'Letra A — zero', detail: 'Confunde com nulípara.', correct: 'Primípara está no primeiro parto — um bebê.' },
          { label: 'Letra C — três', detail: 'Multiparidade, não primeiro parto.', correct: 'Primípara = paridade um.' },
          { label: 'Letra D — cinco ou mais', detail: 'Grande multipara.', correct: 'Primeiro parto → letra B.' },
          { label: 'Letra E — sem relação', detail: 'Nega terminologia obstétrica básica.', correct: 'Primípara define primeiro parto na gestação.' },
        ],
        footer_rule: 'Nulípara ≠ primípara',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g03] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g03] total=${ok}`);
}

main();
