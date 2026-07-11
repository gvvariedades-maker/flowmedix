#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g10 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g10
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g10 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g10';
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
    'vacinação gestacional',
    'náuseas matinais',
    'teste rápido gravidez',
    'eclâmpsia PCR',
    'pirose gestacional',
    'sialorreia',
    'pré-eclâmpsia',
    'queixas comuns gestação',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
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
    sources: [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/\n2612\)\n2613\)\n2614\)\n2615\)\n2616\)\n/g, '\n')
    .replace(/Ministérioda/g, 'Ministério da')
    .replace(/sendopreparada/g, 'sendo preparada')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'unesc-enfermagem-saude-da-mulher-1777104295283-3': {
    family: 'vf',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — seis consultas, vacinação com histórico, ganho de peso, ácido fólico',
    roi_error: 'prenatal_consultas_4',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-natal — V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Quatro assertivas sobre pré-natal — julgar V/F antes das letras.', icon: 'Target' },
          { label: 'Seis consultas (I)', detail: 'Mínimo MS monitora saúde materna e fetal.', icon: 'Calendar' },
          { label: 'Pegadinha vacina sem histórico', detail: 'Vacinas influenza e tétano exigem avaliar carteira — II é F.', icon: 'AlertTriangle' },
          { label: 'Ganho de peso e fólico (III–IV)', detail: 'Avaliar curva ponderal e suplementar fólico no 1º tri — ambos V.', icon: 'Baby' },
        ],
        footer_rule: 'Julgar I–IV antes de combinar letras',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — pré-natal',
        meta: slideMeta,
        content: 'CALENDÁRIO E CUIDADOS',
        rows: [
          { label: 'Consultas', value: 'Mínimo seis consultas de baixo risco', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vacinas', value: 'Influenza e dT — checar histórico vacinal', badge: 'warn' },
          { label: 'Peso', value: 'Curva ponderal identifica riscos metabólicos', badge: 'info' },
          { label: 'Fólico', value: '1º trimestre — prevenção de DTN', badge: 'hot' },
        ],
        footer_rule: 'Sequência V, F, V, V → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar cada assertiva antes de combinar.',
          'Julgar I — seis consultas MS → VERDADEIRA.',
          'Julgar II — vacinar sem avaliar histórico → FALSA.',
          'Julgar III — ganho de peso no pré-natal → VERDADEIRA.',
          'Julgar IV — fólico no 1º tri previne DTN → VERDADEIRA.',
          'Conjunto: V, F, V, V.',
          'Eliminar A, B, D e E — combinações incorretas.',
          'Marcar letra C.',
        ],
        footer_rule: 'V, F, V, V → letra C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMBINAÇÃO V/F',
        items: [
          { label: 'Letra A — V, V, V, V', detail: 'Aceita vacinação sem histórico.', correct: 'II é falsa — vacinas exigem avaliar carteira; gabarito C.' },
          { label: 'Letra B — F, F, V, F', detail: 'Nega seis consultas e fólico.', correct: 'I e IV são verdadeiras — sequência correta é V, F, V, V.' },
          { label: 'Letra D — V, F, F, F', detail: 'Descarta ganho de peso e fólico.', correct: 'III e IV são verdadeiras — marcar C.' },
          { label: 'Letra E — F, F, V, V', detail: 'Nega mínimo de consultas.', correct: 'I é verdadeira — seis consultas MS; letra C.' },
          { label: 'Pegadinha vacina sem histórico', detail: 'Influenza e tétano não são automáticas.', correct: 'Exceção na II — histórico vacinal obrigatório; C.' },
        ],
        footer_rule: 'Vacina com histórico — II é F',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'univida-enfermagem-saude-da-mulher-1777104389226-2': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — náuseas e vômitos no 1º trimestre: piora matinal e com estímulos olfativos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Queixas do 1º trimestre',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Identificar queixa gestacional pelo padrão clínico descrito.', icon: 'Target' },
          { label: 'Náuseas/vômitos (D)', detail: 'Intensas pela manhã, após jejum e com odores fortes.', icon: 'Sunrise' },
          { label: 'Pegadinha tabagismo irrelevante', detail: 'Cheiro de cigarro desencadeia náusea — tabaco segue fator de risco na gestação.', icon: 'Ban' },
          { label: 'Pegadinha pirose', detail: 'Azia pós-prandial — perfil distinto — B.', icon: 'AlertTriangle' },
          { label: 'Pegadinha dispneia', detail: 'Falta de ar costuma surgir no final da gestação — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Manhã + olfato → náuseas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Náuseas gestacionais',
        meta: slideMeta,
        content: 'EMESES GRAVÍDICAS',
        rows: [
          { label: 'Quando', value: '1º trimestre — pico matinal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Gatilhos', value: 'Jejum prolongado e odores (fumo, pasta)', badge: 'info' },
          { label: 'Conduta', value: 'Fracionar dieta — evitar jejum', badge: 'hot' },
          { label: 'Não confundir', value: 'Pirose pós-refeição ou dispneia tardia', badge: 'warn' },
        ],
        footer_rule: 'Padrão matinal → letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler padrão: manhã, jejum, estímulos olfativos.',
          'Eliminar A — dor abdominal/cólica: outro perfil.',
          'Eliminar B — pirose/azia: queimação pós-prandial.',
          'Eliminar C — fraqueza/tontura: inespecífico.',
          'Testar D — náuseas/vômitos: quadro clássico.',
          'Eliminar E — dispneia: gestação avançada.',
          'Marcar letra D.',
        ],
        footer_rule: 'Náuseas matinais → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — QUEIXA GESTACIONAL',
        items: [
          { label: 'Letra A — cólica', detail: 'Dor abdominal não explica gatilho olfativo.', correct: 'Náuseas matinais com odores — letra D.' },
          { label: 'Letra B — pirose', detail: 'Refluxo após refeições — não piora ao acordar.', correct: 'Padrão de emeses gravídicas — gabarito D.' },
          { label: 'Letra C — tontura', detail: 'Fraqueza isolada não fecha o quadro.', correct: 'Vômitos no 1º tri — marcar D.' },
          { label: 'Letra E — dispneia', detail: 'Respiração no fim da gestação.', correct: 'Queixa matinal com olfato — letra D.' },
          { label: 'Pegadinha pirose', detail: 'Banca troca refluxo por náusea.', correct: 'Jejum + manhã + odor → náuseas — D.' },
        ],
        footer_rule: 'Olfato + jejum = náusea',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779562730776-9': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'MS — guia teste rápido gravidez: atraso menstrual mínimo antes do teste imunológico urinário',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teste rápido — gravidez',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Critério de elegibilidade para teste imunológico de gravidez na urina.', icon: 'Target' },
          { label: 'Atraso mínimo (B)', detail: 'Aguardar atraso menstrual curto conforme guia MS.', icon: 'Clock' },
          { label: 'Pegadinha atraso precoce', detail: 'Poucos dias de atraso — falso negativo — A.', icon: 'AlertTriangle' },
          { label: 'Amostra', detail: 'Urina — preferencialmente primeira da manhã.', icon: 'Droplets' },
        ],
        footer_rule: 'Atraso menstrual antes do teste',
      },
      {
        type: 'golden_rule',
        slide_title: 'Teste urinário — MS',
        meta: slideMeta,
        content: 'TESTE RÁPIDO GRAVIDEZ',
        rows: [
          { label: 'Atraso', value: 'Mínimo de uma semana de atraso menstrual', badge: 'hot', emphasis: 'highlight' },
          { label: 'Amostra', value: 'Urina — hCG detectável', badge: 'info' },
          { label: 'Quem faz', value: 'Equipe de enfermagem na APS', badge: 'info' },
          { label: 'Pegadinha', value: 'Testar no 1º dia de atraso — sensibilidade baixa', badge: 'warn' },
        ],
        footer_rule: 'Atraso mínimo → letra B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Guia MS para teste rápido urinário na APS.',
          'Eliminar A — atraso muito curto.',
          'Testar B — atraso mínimo de uma semana.',
          'Eliminar C, D e E — atrasos maiores que o necessário.',
          'Marcar letra B.',
        ],
        footer_rule: 'Uma semana de atraso → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TESTE GRAVIDEZ',
        items: [
          { label: 'Letra A — atraso curto', detail: 'hCG pode ser indetectável.', correct: 'Aguardar atraso mínimo MS — letra B.' },
          { label: 'Letra C — atraso longo', detail: 'Não é o critério mínimo do guia.', correct: 'Uma semana de atraso — gabarito B.' },
          { label: 'Letra D — quinze dias', detail: 'Exagera o tempo de espera.', correct: 'Critério mínimo menor — marcar B.' },
          { label: 'Letra E — um mês', detail: 'Atraso excessivo para elegibilidade.', correct: 'Teste após atraso curto — letra B.' },
          { label: 'Pegadinha atraso precoce', detail: 'Sensibilidade do teste urinário.', correct: 'Mínimo de uma semana — B.' },
        ],
        footer_rule: 'Não testar cedo demais',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-0': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'AHA ACLS 2020 — PCR em gestante: RCP de alta qualidade e acesso venoso acima do diafragma',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Eclâmpsia + PCR',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Gestante a termo, inconsciente, convulsão, sulfato de magnésio — evolui com parada cardiorrespiratória.', icon: 'AlertTriangle' },
          { label: 'RCP prioritária (E)', detail: 'Compressões de alta qualidade — acesso venoso acima do diafragma após intubação.', icon: 'Heart' },
          { label: 'Pegadinha Fowler fetal', detail: 'Posição para oxigenação fetal não é prioridade na PCR — A.', icon: 'XCircle' },
          { label: 'Pegadinha monitor fetal', detail: 'Monitorização fetal não precede reanimação materna — B.', icon: 'Ban' },
        ],
        footer_rule: 'Mãe primeiro — RCP + acesso superior',
      },
      {
        type: 'golden_rule',
        slide_title: 'PCR na gestante',
        meta: slideMeta,
        content: 'REANIMAÇÃO OBSTÉTRICA',
        rows: [
          { label: 'Prioridade', value: 'RCP materna de alta qualidade na parada cardiorrespiratória', badge: 'hot', emphasis: 'highlight' },
          { label: 'Contexto', value: 'Eclâmpsia — convulsão, intubação e sulfato de magnésio', badge: 'info' },
          { label: 'Acesso', value: 'Venoso acima do diafragma — punção periférica calibrosa', badge: 'hot' },
          { label: 'Deslocamento', value: 'Útero grávido comprime veia cava — inclinar se possível', badge: 'info' },
          { label: 'Não fazer', value: 'Priorizar monitor fetal ou Fowler na PCR', badge: 'warn' },
        ],
        footer_rule: 'Acesso acima do diafragma → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Gestante inconsciente com convulsão — sulfato de magnésio — parada cardiorrespiratória no transporte.',
          'Eliminar A — Fowler baixo: não é conduta de RCP.',
          'Eliminar B — monitor fetal antes da mãe.',
          'Eliminar C — ventilações fora do padrão ACLS.',
          'Eliminar D — acelerar sulfato na PCR.',
          'Testar E — acesso venoso acima do diafragma.',
          'Marcar letra E.',
        ],
        footer_rule: 'RCP gestante — acesso superior',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PCR GESTANTE',
        items: [
          { label: 'Letra A — Fowler baixo', detail: 'Posicionamento não substitui RCP.', correct: 'Acesso venoso acima do diafragma — letra E.' },
          { label: 'Letra B — monitor fetal', detail: 'Vitalidade fetal após estabilizar mãe.', correct: 'RCP de alta qualidade primeiro — gabarito E.' },
          { label: 'Letra C — ventilações', detail: 'Ritmo fora do protocolo ACLS.', correct: 'Obter acesso superior ao diafragma — E.' },
          { label: 'Letra D — sulfato rápido', detail: 'Não acelerar infusão na parada.', correct: 'Reanimação com acesso adequado — letra E.' },
          { label: 'Pegadinha Fowler fetal', detail: 'Priorizar feto na PCR materna.', correct: 'Mãe primeiro — acesso acima do diafragma — E.' },
        ],
        footer_rule: 'Salvar a mãe — depois o feto',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104261182-2': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — pirose gestacional: evitar decúbito logo após refeições',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pirose na gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Orientação não farmacológica para reduzir refluxo na gestante.', icon: 'Target' },
          { label: 'Não deitar (D)', detail: 'Aguardar uma a duas horas após comer antes de deitar.', icon: 'Bed' },
          { label: 'Pegadinha reduzir refeições', detail: 'Conduta é fracionar — não reduzir frequência — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha travesseiro', detail: 'Elevar tronco ajuda — dispensar travesseiro piora — C.', icon: 'XCircle' },
        ],
        footer_rule: 'Refluxo: não deitar após comer',
      },
      {
        type: 'golden_rule',
        slide_title: 'AB 32 — pirose',
        meta: slideMeta,
        content: 'REFLUXO GESTACIONAL',
        rows: [
          { label: 'Conduta', value: 'Não deitar logo após refeições', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dieta', value: 'Fracionar em porções leves', badge: 'info' },
          { label: 'Posição', value: 'Elevar tronco ao dormir', badge: 'info' },
          { label: 'Evitar', value: 'Jejum prolongado e alimentos gordurosos à noite', badge: 'warn' },
        ],
        footer_rule: 'Esperar após refeição → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pirose por relaxamento esofágico e compressão uterina.',
          'Eliminar A — reduzir frequência das refeições.',
          'Eliminar B — água com açúcar.',
          'Eliminar C — dispensar travesseiro.',
          'Testar D — não deitar uma a duas horas após comer.',
          'Eliminar E — proibir alimentos inocentes à noite.',
          'Marcar letra D.',
        ],
        footer_rule: 'Aguardar após comer → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PIROSE',
        items: [
          { label: 'Letra A — menos refeições', detail: 'Fracionar aumenta frequência.', correct: 'Não deitar após refeições — letra D.' },
          { label: 'Letra B — água com açúcar', detail: 'Sem evidência para refluxo.', correct: 'Aguardar antes de deitar — gabarito D.' },
          { label: 'Letra C — sem travesseiro', detail: 'Elevação do tronco é útil.', correct: 'Intervalo pós-prandial — marcar D.' },
          { label: 'Letra E — evitar leite à noite', detail: 'Restrição alimentar inadequada.', correct: 'Não deitar após comer — letra D.' },
          { label: 'Pegadinha reduzir refeições', detail: 'Confunde fracionar com reduzir.', correct: 'Esperar uma a duas horas — D.' },
        ],
        footer_rule: 'Gravidade contra refluxo',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104340484-0': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — sialorreia gestacional: hidratação abundante e medidas de conforto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sialorreia — 1º tri',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Gestante no 1º trimestre com excesso de saliva no pré-natal.', icon: 'User' },
          { label: 'Hidratação (D)', detail: 'Líquidos em abundância — prevenir desidratação.', icon: 'Droplets' },
          { label: 'Pegadinha clorpromazina', detail: 'Fármaco não é conduta de rotina do TE — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha alto risco', detail: 'Sialorreia fisiológica não exige encaminhamento — E.', icon: 'XCircle' },
        ],
        footer_rule: 'Hidratar — medida de suporte',
      },
      {
        type: 'golden_rule',
        slide_title: 'Sialorreia — MS',
        meta: slideMeta,
        content: 'EXCESSO DE SALIVA',
        rows: [
          { label: 'Conduta', value: 'Hidratação oral abundante', badge: 'hot', emphasis: 'highlight' },
          { label: 'Conforto', value: 'Deglutir ou absorver com lenço macio', badge: 'info' },
          { label: 'Dieta', value: 'Fracionar refeições leves', badge: 'info' },
          { label: 'Não é', value: 'Prescrever neuroléptico ou alto risco automático', badge: 'warn' },
        ],
        footer_rule: 'Líquidos abundantes → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sialorreia comum no início da gestação.',
          'Eliminar A — clorpromazina sem prescrição.',
          'Eliminar B — evitar deglutir saliva.',
          'Eliminar C — dieta restritiva com três refeições.',
          'Testar D — líquidos abundantes contra desidratação.',
          'Eliminar E — encaminhar alto risco sem critério.',
          'Marcar letra D.',
        ],
        footer_rule: 'Hidratação → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SIALORREIA',
        items: [
          { label: 'Letra A — clorpromazina', detail: 'TE não prescreve neuroléptico.', correct: 'Hidratação abundante — letra D.' },
          { label: 'Letra B — não deglutir', detail: 'Evitar deglutição agrava desconforto.', correct: 'Líquidos para prevenir desidratação — D.' },
          { label: 'Letra C — três refeições', detail: 'Fracionar — não restringir.', correct: 'Orientar hidratação — gabarito D.' },
          { label: 'Letra E — alto risco', detail: 'Queixa fisiológica na APS.', correct: 'Líquidos abundantes — letra D.' },
          { label: 'Pegadinha clorpromazina', detail: 'Medicamento fora do escopo do TE.', correct: 'Medida não farmacológica — D.' },
        ],
        footer_rule: 'Suporte hidroeletrolítico na APS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104408379-3': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS 2012) — PA elevada após viabilidade: investigar pré-eclâmpsia',
    roi_error: 'prenatal_pa_hipertensao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA na gestação',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Gabriela na vigésima primeira semana — aferição arterial com pressóricos acima do normal.', icon: 'Gauge' },
          { label: 'Pré-eclâmpsia (C)', detail: 'Hipertensão gestacional após viabilidade — investigar proteinúria e sinais de gravidade.', icon: 'AlertTriangle' },
          { label: 'Pegadinha eclâmpsia', detail: 'Convulsão ausente — ainda não é eclâmpsia — A.', icon: 'XCircle' },
          { label: 'Pegadinha HELLP', detail: 'Síndrome específica com hemólise e enzimas — D.', icon: 'Ban' },
        ],
        footer_rule: 'PA alta após viabilidade → investigar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Síndromes hipertensivas',
        meta: slideMeta,
        content: 'HIPERTENSÃO GESTACIONAL',
        rows: [
          { label: 'Limite', value: 'Pressóricos acima do normal na aferição arterial', badge: 'hot', emphasis: 'highlight' },
          { label: 'Marco', value: 'Vigésima primeira semana — após viabilidade', badge: 'info' },
          { label: 'Pré-eclâmpsia', value: 'PA alta + proteinúria ou sinais de gravidade', badge: 'hot' },
          { label: 'Eclâmpsia', value: 'Convulsão em gestante hipertensa', badge: 'warn' },
          { label: 'Conduta', value: 'Repetir PA, proteinúria e encaminhar se necessário', badge: 'info' },
        ],
        footer_rule: 'PA limítrofe → pré-eclâmpsia — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PA elevada no 2º trimestre — classificar síndrome hipertensiva.',
          'Eliminar A — eclâmpsia: sem convulsão.',
          'Eliminar B — restrição fetal: consequência, não diagnóstico inicial.',
          'Testar C — pré-eclâmpsia: hipertensão gestacional a investigar.',
          'Eliminar D — HELLP: perfil laboratorial específico.',
          'Eliminar E — pré-eclâmpsia grave: sem critérios de gravidade no enunciado.',
          'Marcar letra C.',
        ],
        footer_rule: 'Sem convulsão — pré-eclâmpsia → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPERTENSÃO',
        items: [
          { label: 'Letra A — eclâmpsia', detail: 'Exige convulsão.', correct: 'PA elevada sem crise — pré-eclâmpsia — C.' },
          { label: 'Letra B — restrição fetal', detail: 'Complicação fetal tardia.', correct: 'Síndrome hipertensiva materna — letra C.' },
          { label: 'Letra D — HELLP', detail: 'Hemólise, enzimas hepáticas, plaquetas.', correct: 'Hipertensão gestacional inicial — gabarito C.' },
          { label: 'Letra E — grave', detail: 'Sem sinais de gravidade descritos.', correct: 'Investigar pré-eclâmpsia — marcar C.' },
          { label: 'Pegadinha eclâmpsia', detail: 'Confunde elevação pressórica com crise.', correct: 'Monitorar proteinúria — letra C.' },
        ],
        footer_rule: 'Convulsão = eclâmpsia — aqui é C',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-saude-da-mulher-1777104408379-7': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — queixas gestacionais: flatulência, sialorreia e dispneia leve',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Associar queixa × conduta',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Relacionar queixa gestacional à orientação correta do MS.', icon: 'Target' },
          { label: 'I Flatulência → c', detail: 'Evitar alimentos de alta fermentação.', icon: 'Wheat' },
          { label: 'II Sialorreia → b', detail: 'Dieta fracionada em refeições leves.', icon: 'Utensils' },
          { label: 'III Dispneia → a', detail: 'Repouso em decúbito lateral esquerdo.', icon: 'Bed' },
        ],
        footer_rule: 'I-c · II-b · III-a → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Queixas comuns — MS',
        meta: slideMeta,
        content: 'CONFORTO GESTACIONAL',
        rows: [
          { label: 'Flatulência', value: 'Evitar fermentáveis — ovo, feijão, leite, açúcar', badge: 'info' },
          { label: 'Sialorreia', value: 'Fracionar dieta em refeições leves', badge: 'hot', emphasis: 'highlight' },
          { label: 'Dispneia leve', value: 'Decúbito lateral esquerdo — melhora retorno venoso', badge: 'hot' },
          { label: 'Associação', value: 'I–c · II–b · III–a', badge: 'hot' },
        ],
        footer_rule: 'Decúbito esquerdo na dispneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Associar cada queixa à orientação MS.',
          'I Flatulência → evitar fermentáveis → letra c.',
          'II Sialorreia → dieta fracionada → letra b.',
          'III Dispneia leve → decúbito lateral esquerdo → letra a.',
          'Conjunto: I–c; II–b; III–a.',
          'Eliminar A, B, C e E.',
          'Marcar letra D.',
        ],
        footer_rule: 'I-c · II-b · III-a → letra D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSOCIAÇÃO',
        items: [
          { label: 'Letra A — I-b', detail: 'Troca flatulência com dieta fracionada.', correct: 'Flatulência → evitar fermentáveis — associação D.' },
          { label: 'Letra B — I-a', detail: 'Decúbito não trata gases.', correct: 'Sialorreia → dieta fracionada — gabarito D.' },
          { label: 'Letra C — I-a', detail: 'Permuta queixas I e III.', correct: 'Dispneia → decúbito esquerdo — letra D.' },
          { label: 'Letra E — II-a', detail: 'Sialorreia não pede repouso lateral.', correct: 'Três pares corretos — marcar D.' },
          { label: 'Pegadinha decúbito na flatulência', detail: 'Posição não reduz fermentação.', correct: 'I-c · II-b · III-a — letra D.' },
        ],
        footer_rule: 'Cada queixa tem conduta própria',
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
    console.log(`[handcraft:sm-g10] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g10] total=${ok}`);
}

main();
