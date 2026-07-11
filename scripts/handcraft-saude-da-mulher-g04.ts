#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g04 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g04
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g04 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g04';
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
    'trimestres gestação',
    'consultas pré-natal',
    'teste estresse fetal',
    'alto risco gestacional',
    'glicemia jejum gestação',
    'aborto e violência sexual',
  ],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — Planejamento familiar',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: ['anticoncepção de emergência', 'métodos contraceptivos', 'DIU', 'preservativo'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis';
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
  'fau-unicentro-enfermagem-saude-da-mulher-1777104329543-8': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — gestação dividida em três trimestres',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Divisão da gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Gravidez sem intercorrências — como é dividida temporalmente.', icon: 'Target' },
          { label: 'Três trimestres', detail: 'Gravidez dividida em trimestres — padrão obstétrico.', icon: 'Calendar' },
          { label: 'Pegadinha bimestre', detail: 'Bimestre não divide a gravidez — distrator A e D.', icon: 'AlertTriangle' },
          { label: 'Pegadinha semestre', detail: 'Dois semestres (letra C) não é a divisão clássica.', icon: 'XCircle' },
        ],
        footer_rule: 'Gravidez dividida em três trimestres — sem intercorrências',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cronologia — gestação',
        meta: slideMeta,
        content: 'DIVISÃO TEMPORAL',
        rows: [
          { label: 'Padrão', value: 'Gravidez em três trimestres', badge: 'hot', emphasis: 'highlight' },
          { label: 'Bimestres', value: 'Não é divisão da gestação', badge: 'warn' },
          { label: 'Semestres', value: 'Dois semestres — distrator', badge: 'warn' },
          { label: 'Quatro trimestres', value: 'Inexistente — letra E falsa', badge: 'info' },
        ],
        footer_rule: 'Bimestre ≠ divisão obstétrica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar divisão temporal padrão da gestação.',
          'Eliminar A — três bimestres: nomenclatura incorreta.',
          'Testar B — três trimestres: divisão clássica.',
          'Eliminar C — dois semestres.',
          'Eliminar D — seis bimestres.',
          'Eliminar E — quatro trimestres.',
          'Marcar letra B.',
        ],
        footer_rule: '3 trimestres → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CRONOLOGIA',
        items: [
          { label: 'Letra A — bimestres', detail: 'Confunde unidade temporal obstétrica.', correct: 'Divisão canônica: três trimestres.' },
          { label: 'Letra C — semestres', detail: 'Dois semestres não é o padrão.', correct: 'Gestação = 3 trimestres — letra B.' },
          { label: 'Letra D — seis bimestres', detail: 'Inventa subdivisão inexistente.', correct: 'Trimestre é a unidade correta.' },
          { label: 'Letra E — quatro trimestres', detail: 'Exagera a divisão.', correct: 'São três trimestres.' },
        ],
        footer_rule: 'Bimestre × trimestre',
      },
    ],
  },

  'fau-unicentro-enfermagem-saude-da-mulher-1777104340484-1': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS planejamento familiar — anticoncepção de emergência após relação sexual',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anticoncepção de emergência',
        meta: slideMeta,
        items: [
          { label: 'AE — definição', detail: 'Método para evitar gravidez após relação sexual desprotegida.', icon: 'Pill' },
          { label: 'Momento', detail: 'Pós-coito — não antes nem durante como método principal.', icon: 'Clock' },
          { label: 'Pegadinha IST (D)', detail: 'AE hormonal não previne todas as IST — barreira é outro método.', icon: 'AlertTriangle' },
          { label: 'Janela', detail: 'Quanto antes após a relação, maior eficácia.', icon: 'Zap' },
        ],
        footer_rule: 'AE = após relação sexual',
      },
      {
        type: 'golden_rule',
        slide_title: 'AE — comparativo',
        meta: slideMeta,
        content: 'ANTICONCEPÇÃO DE EMERGÊNCIA',
        rows: [
          { label: 'Quando', value: 'Após relação sexual desprotegida', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não é', value: 'Antes ou durante a relação (método regular)', badge: 'warn' },
          { label: 'IST', value: 'Não substitui preservativo/barreira', badge: 'warn' },
          { label: 'Acesso', value: 'UBS — sem receita em protocolos MS', badge: 'info' },
        ],
        footer_rule: 'Após relação → letra B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Definir anticoncepção de emergência (AE).',
          'Eliminar A — “antes da relação”: é método regular, não AE.',
          'Testar B — “após a relação sexual”: definição correta.',
          'Eliminar C — “durante a relação”: não é AE.',
          'Eliminar D — previne todas IST: AE hormonal não cobre IST.',
          'Eliminar E — combinação A+D incorreta.',
          'Marcar letra B.',
        ],
        footer_rule: 'Pós-coito → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AE',
        items: [
          { label: 'Letra A — antes da relação', detail: 'Confunde com contracepção regular.', correct: 'AE é após relação desprotegida.' },
          { label: 'Letra C — durante a relação', detail: 'Momento errado para AE.', correct: 'Gabarito: após a relação — B.' },
          { label: 'Letra D — previne IST', detail: 'Atribui barreira à AE hormonal.', correct: 'AE evita gravidez — IST exige preservativo.' },
          { label: 'Letra E — A e D', detail: 'Combina dois erros.', correct: 'Só B define AE corretamente.' },
        ],
        footer_rule: 'AE ≠ barreira IST',
      },
    ],
  },

  'fenix-instituto-enfermagem-saude-da-mulher-1777104261182-7': {
    family: 'vf',
    branch: 'mulher_planejamento',
    guideline: 'MS planejamento familiar — métodos contraceptivos (hormonal, DIU, laqueadura, barreira)',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Métodos contraceptivos — V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas (I–IV) sobre métodos — julgar antes das letras.', icon: 'Target' },
          { label: 'Hormonal oral (I)', detail: 'Exige prescrição e acompanhamento médico — verdadeira.', icon: 'Pill' },
          { label: 'DIU (II)', detail: 'Dispositivo intrauterino — não é método de barreira.', icon: 'XCircle' },
          { label: 'Laqueadura (III)', detail: 'Método definitivo/irreversível na prática — verdadeira.', icon: 'Scissors' },
          { label: 'Pegadinha DIU barreira', detail: 'II falsa — DIU é LARC intrauterino, não barreira mecânica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I, III e IV verdadeiras — II falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'PF — classificação',
        meta: slideMeta,
        content: 'MÉTODOS CONTRACEPTIVOS',
        rows: [
          { label: 'Hormonal oral', value: 'Prescrição + acompanhamento', badge: 'info' },
          { label: 'DIU', value: 'Intrauterino — não é barreira', badge: 'warn', emphasis: 'highlight' },
          { label: 'Laqueadura', value: 'Esterilização definitiva', badge: 'info' },
          { label: 'Preservativo', value: 'Barreira — IST + gravidez', badge: 'hot' },
        ],
        footer_rule: 'DIU ≠ barreira',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I a IV.',
          'Julgar I: hormonal oral requer prescrição → VERDADEIRA.',
          'Julgar II: DIU como barreira → FALSA (é dispositivo intrauterino).',
          'Julgar III: laqueadura irreversível → VERDADEIRA.',
          'Julgar IV: preservativos protegem DST e gravidez → VERDADEIRA.',
          'Conjunto: I, III e IV.',
          'Eliminar B (II,III), C (só I,IV sem III), D (inclui II falsa).',
          'Marcar letra A.',
        ],
        footer_rule: 'I+III+IV → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIU × BARREIRA',
        items: [
          { label: 'Letra B — II e III', detail: 'Aceita II falsa sobre DIU barreira.', correct: 'DIU não é método de barreira — II é falsa.' },
          { label: 'Letra C — I e IV', detail: 'Omite III verdadeira sobre laqueadura.', correct: 'III também é verdadeira — laqueadura irreversível.' },
          { label: 'Letra D — todas', detail: 'Inclui II incorreta.', correct: 'II falsa elimina — só I, III e IV.' },
          { label: 'Confundir DIU com preservativo', detail: 'Barreira mecânica ≠ dispositivo intrauterino.', correct: 'Preservativo = barreira (IV); DIU = LARC.' },
        ],
        footer_rule: 'DIU intrauterino — não barreira',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fepese-enfermagem-processo-de-enfermagem-1780002217274-2': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — mínimo 6 consultas; TIG na UBS para captação precoce',
    roi_error: 'prenatal_consultas_4',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-natal — consultas e TIG',
        meta: slideMeta,
        items: [
          { label: 'Contexto MS', detail: 'TIG na UBS para gestantes com atraso menstrual — captação precoce.', icon: 'Target' },
          { label: 'Mínimo consultas', detail: 'Seis consultas de baixo risco — parâmetro MS atual.', icon: 'Calendar' },
          { label: 'Papel do TE', detail: 'Orientar e encaminhar para médico/enfermeiro solicitar exame.', icon: 'User' },
          { label: 'Pegadinha 4 consultas', detail: 'Número desatualizado — não é o mínimo vigente.', icon: 'AlertTriangle' },
        ],
        footer_rule: '6 consultas + TIG precoce',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — pré-natal',
        meta: slideMeta,
        content: 'CONSULTAS E CAPTAÇÃO',
        rows: [
          { label: 'Mínimo', value: '6 consultas de baixo risco', badge: 'hot', emphasis: 'highlight' },
          { label: 'TIG', value: 'UBS — atraso menstrual suspeito', badge: 'info' },
          { label: 'Pegadinha 4', value: 'Desatualizado — não é mínimo MS', badge: 'warn' },
          { label: 'TE', value: 'Orienta e articula com enfermeiro/médico', badge: 'info' },
        ],
        footer_rule: '6 consultas = gabarito',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Separar contexto TIG (captação) da pergunta sobre número mínimo de consultas.',
          'Eliminar A — 2 consultas.',
          'Eliminar B — 3 consultas.',
          'Eliminar C — 4 consultas (desatualizado).',
          'Testar D — 6 consultas: parâmetro MS.',
          'Eliminar E — 9 consultas (alto risco, não mínimo universal).',
          'Marcar letra D.',
        ],
        footer_rule: 'Mínimo → 6 → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÚMERO DE CONSULTAS',
        items: [
          { label: 'Letra A — 2 consultas', detail: 'Muito abaixo do mínimo.', correct: 'MS: 6 consultas de baixo risco.' },
          { label: 'Letra B — 3 consultas', detail: 'Ainda insuficiente.', correct: 'Mínimo vigente: 6 consultas.' },
          { label: 'Letra C — 4 consultas', detail: 'Pegadinha de prova antiga.', correct: 'Humanização/AB 32: 6+ consultas.' },
          { label: 'Letra E — 9 consultas', detail: 'Protocolo de alto risco, não mínimo universal.', correct: 'Baixo risco: 6 consultas — D.' },
        ],
        footer_rule: '4 consultas = ROI desatualizado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funatec-enfermagem-saude-da-mulher-1777104415052-3': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — teste de estresse fetal: vitalidade durante contrações uterinas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teste de estresse fetal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Finalidade do teste de estresse fetal no pré-natal.', icon: 'Target' },
          { label: 'Durante contrações', detail: 'Avalia resposta cardíaca fetal às contrações — vitalidade.', icon: 'Activity' },
          { label: 'vs. Repouso (A)', detail: 'FCF em repouso é cardiotocografia basal, não estresse.', icon: 'XCircle' },
          { label: 'Pegadinha maturidade pulmonar', detail: 'Maturidade pulmonar = outro exame (ex.: L/S), não estresse.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Estresse = vitalidade nas contrações',
      },
      {
        type: 'golden_rule',
        slide_title: 'Exames — vitalidade fetal',
        meta: slideMeta,
        content: 'TESTE DE ESTRESSE FETAL',
        rows: [
          { label: 'Finalidade', value: 'Vitalidade fetal durante contrações', badge: 'hot', emphasis: 'highlight' },
          { label: 'CTG basal', value: 'FCF em repouso — outro momento', badge: 'info' },
          { label: 'Maturidade pulmonar', value: 'Lecitina/esfingomielina — outro objetivo', badge: 'warn' },
          { label: 'Membranas', value: 'Integridade — ultrassom/outros exames', badge: 'info' },
        ],
        footer_rule: 'Contrações uterinas = estresse fetal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar o que o teste de estresse fetal mede.',
          'Eliminar A — FCF em repouso: cardiotocografia basal.',
          'Testar B — vitalidade fetal durante contrações uterinas.',
          'Eliminar C — integridade de membranas.',
          'Eliminar D — anticorpos maternos no sangue fetal.',
          'Eliminar E — maturidade pulmonar.',
          'Marcar letra B.',
        ],
        footer_rule: 'Contrações → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXAMES FETAIS',
        items: [
          { label: 'Letra A — repouso', detail: 'Confunde com CTG sem estímulo.', correct: 'Estresse fetal = resposta às contrações.' },
          { label: 'Letra C — membranas', detail: 'Objetivo anatômico diferente.', correct: 'Vitalidade durante contrações — B.' },
          { label: 'Letra D — anticorpos', detail: 'Imunologia materno-fetal, não estresse.', correct: 'Teste avalia vitalidade nas contrações.' },
          { label: 'Letra E — maturidade pulmonar', detail: 'Exame bioquímico/amniocentese.', correct: 'Estresse = contrações uterinas.' },
        ],
        footer_rule: 'Repouso × estresse',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funcern-enfermagem-saude-da-mulher-1777104301763-0': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — fatores de risco: dependência química indica alto risco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alto risco gestacional',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Fator que indica encaminhamento ao pré-natal de alto risco.', icon: 'Target' },
          { label: 'Dependência química (D)', detail: 'Uso de drogas lícitas ou ilícitas — alto risco materno-fetal.', icon: 'AlertCircle' },
          { label: 'vs. Vulnerabilidade social', detail: 'Baixa escolaridade ou conjugal insegura: atenção, mas não o gabarito da questão.', icon: 'Info' },
          { label: 'Pegadinha cirurgia uterina', detail: 'Cirurgia prévia é fator de atenção, mas a banca aponta dependência química.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Drogas = alto risco clínico',
      },
      {
        type: 'golden_rule',
        slide_title: 'Estratificação — risco',
        meta: slideMeta,
        content: 'ALTO RISCO GESTACIONAL',
        rows: [
          { label: 'Dependência química', value: 'Encaminhar pré-natal de alto risco', badge: 'hot', emphasis: 'highlight' },
          { label: 'Cirurgia uterina', value: 'Fator de atenção — avaliar caso', badge: 'info' },
          { label: 'Vulnerabilidade social', value: 'Apoio psicossocial — nem sempre alto risco clínico', badge: 'info' },
          { label: 'Equipe', value: 'Estratificar e referenciar quando indicado', badge: 'info' },
        ],
        footer_rule: 'Gabarito prova: dependência química',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar fator de alto risco clínico na gestação.',
          'Eliminar A — baixa escolaridade: vulnerabilidade, não critério clínico principal aqui.',
          'Eliminar B — cirurgia uterina anterior: atenção, mas não gabarito.',
          'Eliminar C — situação conjugal insegura: fator psicossocial.',
          'Testar D — dependência de drogas lícitas ou ilícitas.',
          'Marcar letra D.',
        ],
        footer_rule: 'Drogas → alto risco → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTRATIFICAÇÃO',
        items: [
          { label: 'Letra A — escolaridade', detail: 'Determinante social, não alto risco clínico direto.', correct: 'Dependência química indica alto risco — D.' },
          { label: 'Letra B — cirurgia uterina', detail: 'Fator relevante, mas não o gabarito.', correct: 'Uso de drogas lícitas/ilícitas = alto risco.' },
          { label: 'Letra C — conjugal insegura', detail: 'Apoio psicossocial necessário.', correct: 'Alto risco clínico: dependência química.' },
          { label: 'Confundir social × clínico', detail: 'Banca cobra fator clínico de referência.', correct: 'Drogas → pré-natal de alto risco.' },
        ],
        footer_rule: 'Social ≠ alto risco clínico (nesta questão)',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'funcern-enfermagem-saude-da-mulher-1777104415052-7': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — glicemia de jejum alterada na gestação = diabetes gestacional',
    roi_error: 'prenatal_ttgo_1_tri',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Glicemia de jejum — gestação',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Gestante com glicemia de jejum elevada no pré-natal.', icon: 'User' },
          { label: 'Limite DG', detail: 'Glicemia de jejum alterada na gestação — acima do referencial MS.', icon: 'Activity' },
          { label: 'Classificação', detail: 'Valor do caso acima do limite → diabetes gestacional.', icon: 'AlertCircle' },
          { label: 'Pegadinha adequado', detail: '“Nível adequado” ignora valor alterado do enunciado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Jejum alterado na gestação = DG',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — glicemia jejum',
        meta: slideMeta,
        content: 'DIABETES GESTACIONAL',
        rows: [
          { label: 'Referência 1º tri', value: 'Glicemia de jejum na 1ª consulta', badge: 'info' },
          { label: 'DG — jejum', value: 'Valor alterado na gestação = diabetes gestacional', badge: 'hot', emphasis: 'highlight' },
          { label: 'Normal', value: 'Glicemia de jejum dentro do referencial', badge: 'info' },
          { label: 'TTGO', value: 'Indicado no 2º–3º trimestre se fator de risco', badge: 'warn' },
        ],
        footer_rule: 'Jejum alterado na gestação = diabetes gestacional',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Interpretar glicemia de jejum da gestante no pré-natal.',
          'Comparar com limite gestacional para diabetes gestacional.',
          'Eliminar A — diabetes tipo 2: diagnóstico distinto.',
          'Eliminar B — pré-diabetes: não é a classificação gestacional direta.',
          'Eliminar C — nível adequado: valor está acima do limite.',
          'Testar D — diabetes gestacional.',
          'Marcar letra D.',
        ],
        footer_rule: 'Jejum alterado → DG → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GLICEMIA NA GESTAÇÃO',
        items: [
          { label: 'Letra A — diabetes tipo 2', detail: 'Confunde com DM prévio não gestacional.', correct: 'Valor elevado no pré-natal = diabetes gestacional.' },
          { label: 'Letra B — pré-diabetes', detail: 'Categoria não gestacional neste contexto.', correct: 'Critério gestacional: valor alterado = diabetes gestacional.' },
          { label: 'Letra C — adequado', detail: 'Ignora resultado alterado do caso.', correct: 'Glicemia de jejum elevada classifica como diabetes gestacional.' },
          { label: 'Usar corte não gestacional', detail: 'Limite na gestação é específico.', correct: 'Valor alterado no pré-natal = diabetes gestacional.' },
        ],
        footer_rule: 'Corte gestacional ≠ população geral',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'fundatec-enfermagem-saude-da-mulher-1777104306781-0': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'MS/legislação brasileira — aborto: saúde pública; VS permite interrupção; sem coerção',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Interrupção da gestação — ética',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas (I–IV) sobre aborto e cuidados de enfermagem.', icon: 'Target' },
          { label: 'Saúde pública (I)', detail: 'Aborto como condição de saúde — sem discriminação.', icon: 'Heart' },
          { label: 'Violência sexual (III)', detail: 'Interrupção legal em risco à saúde/ectópica/VS no Brasil.', icon: 'Scale' },
          { label: 'Pegadinha coerção (II)', detail: 'Profissional não deve pressionar manutenção da gestação após VS.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I e III verdadeiras — II e IV falsas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Marco legal e ética',
        meta: slideMeta,
        content: 'INTERRUPÇÃO DA GESTAÇÃO',
        rows: [
          { label: 'Aborto', value: 'Condição de saúde pública — sem julgamento', badge: 'hot' },
          { label: 'Violência sexual', value: 'Interrupção permitida — protocolo MS', badge: 'hot', emphasis: 'highlight' },
          { label: 'Ética', value: 'Não coercer manutenção da gestação', badge: 'warn' },
          { label: 'Ectópica', value: 'Risco à saúde — interrupção legal', badge: 'info' },
        ],
        footer_rule: 'II e IV são falsas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I a IV.',
          'Julgar I: aborto como saúde pública sem discriminação → VERDADEIRA.',
          'Julgar II: incentivar manutenção após VS → FALSA (autonomia e protocolo).',
          'Julgar III: interrupção legal em ectópica/risco → VERDADEIRA.',
          'Julgar IV: curetagem ilegal em VS → FALSA (interrupção legal em VS).',
          'Conjunto: I e III.',
          'Eliminar B, C, D, E (incluem II ou IV falsas).',
          'Marcar letra A.',
        ],
        footer_rule: 'I e III verdadeiras — II coerção e IV ilegalidade falsa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÉTICA E LEGISLAÇÃO',
        items: [
          { label: 'Letra B — II e IV', detail: 'Combina coerção após violência sexual (II) e ilegalidade falsa (IV).', correct: 'II é falsa — profissional não deve pressionar manutenção da gestação.' },
          { label: 'Letra C — I, II e III', detail: 'Inclui II falsa sobre coerção na violência sexual.', correct: 'II invalida — só I e III corretas.' },
          { label: 'Letra D — II, III e IV', detail: 'Inclui II (coerção) e IV (curetagem ilegal em VS) falsas.', correct: 'Interrupção em VS é legal — IV é falsa.' },
          { label: 'Letra E — todas', detail: 'II e IV são falsas.', correct: 'Coerção após VS (II) e ilegalidade da curetagem (IV) — só I e III.' },
        ],
        footer_rule: 'Não coercer gestação após VS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
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
    console.log(`[handcraft:sm-g04] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g04] total=${ok}`);
}

main();
