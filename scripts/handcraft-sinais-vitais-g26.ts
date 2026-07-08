#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g26 (8 slugs P1 vitals_fc_faixas batch 1).
 * Novo cluster após esgotamento vitals_pa_tecnica (g01–g25).
 *
 *   npm run handcraft:sinais-vitais-g26
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g26';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'pulso radial 60 s',
    'pulso central × periférico',
    'FC apical — ictus 5º EIC esquerdo',
    'bradicardia <60',
    'taquicardia >100',
    'taquisfigmia',
    'bradisfigmia',
    'artéria braquial — fossa antecubital',
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

type Branch =
  | 'vitals_pa_tecnica'
  | 'vitals_interpretacao'
  | 'vitals_fc_faixas'
  | 'vitals_generico';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
  exam_vs_current?: string;
  roi_error?: string;
  slides: unknown[];
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
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'agirh-enfermagem-verificacao-de-sinais-vitais-1779344137078-0': {
    family: 'protocolo',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — FC apical: diafragma do estetoscópio sobre ictus cordis · 5º espaço intercostal esquerdo · linha hemiclavicular · pele nua',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC apical — local do ictus',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Onde colocar o diafragma do estetoscópio para verificação da FC apical sobre o ictus cordis?',
            icon: 'Target',
          },
          {
            label: 'Ictus cordis',
            detail:
              'Impulso cardíaco palpável — ápice do ventrículo esquerdo projeta-se no tórax.',
            icon: 'Heart',
          },
          {
            label: 'Sítio padrão MS',
            detail:
              '5º espaço intercostal esquerdo, linha hemiclavicular — pele diretamente sob o estetoscópio.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — 3º EIC',
            detail:
              'Alternativas A e B citam 3º espaço — região mais alta, não é o ictus clássico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — lado direito',
            detail:
              'Alternativas A e C usam hemitórax direito — ápice ventricular esquerdo fica à esquerda.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — faixa FC',
            detail:
              'Após auscultar, compare com 60–100 bpm (normocárdico) · bradicardia <60 · taquicardia >100 — não confunda com foco valvar errado.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'Ictus = 5º EIC esquerdo · hemiclavicular',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: local do diafragma para FC apical no ictus cordis.',
          'Lembrar: ápice cardíaco = 5º EIC esquerdo na linha hemiclavicular (MS).',
          'Testar A — 3º EIC direito: lado e altura errados → eliminar.',
          'Testar B — 3º EIC esquerdo: lado certo, altura inadequada → eliminar.',
          'Testar C — 5º EIC direito: altura próxima, lado errado → eliminar.',
          'Testar D — 5º EIC esquerdo, hemiclavicular: ictus padrão → candidata.',
          'Confirmar contato direto pele–estetoscópio.',
          'Marcar D.',
        ],
        footer_rule: '5º EIC esquerdo hemiclavicular → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FC apical',
        meta: slideMeta,
        content: 'DECORE — ONDE AUSCULTAR O ÁPICE',
        rows: [
          { label: 'Ictus cordis', value: '5º EIC esquerdo · linha hemiclavicular', sv_kind: 'fc', badge: 'hot' },
          { label: 'Técnica', value: 'Diafragma sobre pele nua — sem roupa', sv_kind: 'fc', badge: 'ok' },
          { label: '3º EIC', value: 'Região mais alta — não é ápice padrão', sv_kind: 'fc', badge: 'warn' },
          { label: 'Hemitórax direito', value: 'Não abriga ápice ventricular esquerdo', sv_kind: 'meta', badge: 'warn' },
          { label: 'FC adulto repouso', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Apical = esquerda · 5º espaço · hemiclavicular',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ICTUS AGIRH',
        items: [
          {
            label: 'Letra A — 3º EIC direito',
            detail: 'Terceiro espaço no hemitórax direito.',
            correct:
              'Ictus do ventrículo esquerdo projeta-se no 5º EIC esquerdo — não no 3º espaço direito.',
          },
          {
            label: 'Letra B — 3º EIC esquerdo',
            detail: 'Terceiro espaço intercostal esquerdo.',
            correct:
              'Mesmo no lado correto, o 3º espaço fica cranial demais — referência MS é 5º EIC esquerdo hemiclavicular.',
          },
          {
            label: 'Letra C — 5º EIC direito',
            detail: 'Quinto espaço no lado direito.',
            correct:
              'Altura próxima do ápice, porém o impulso apical é palpado/auscultado no hemitórax esquerdo.',
          },
          {
            label: 'Confundir com focos auscultatórios',
            detail: 'Aluno marca região de válvulas (2º–3º EIC) em vez do ápice.',
            correct:
              'FC apical pelo ictus exige 5º EIC esquerdo linha hemiclavicular — não foco valvar superior.',
          },
        ],
        footer_rule: 'Só D fecha ictus + lado + altura',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344111854-6': {
    family: 'vf',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — pulso central: carótida · femoral · aorta; periférico: radial · ulnar · poplítea · tibial posterior · FC apical no 5º EIC esquerdo',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — pulso e FC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre FC/pulso — julgue cada item antes da sequência V/F.',
            icon: 'Target',
          },
          {
            label: 'Central × periférico (I)',
            detail:
              'Carótida e femoral são centrais; radial, ulnar, poplítea e tibial posterior são periféricos — item inverte → falso.',
            icon: 'GitCompare',
          },
          {
            label: 'Ausência de pulso (II)',
            detail:
              'Pulso ausente pode indicar oclusão arterial — item verdadeiro.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Qualidade do pulso (III)',
            detail:
              'Avaliar frequência + ritmo + força (qualidade) — item verdadeiro.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — FC apical (IV)',
            detail:
              'Item cita 3º EIC hemiclavicular para apical — MS exige 5º EIC esquerdo → falso.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'I=F (inverte central/periférico) · II=V · III=V · IV=F',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro itens empilhados — julgar cada afirmativa.',
          'Julgar I: carótida/femoral periféricos e radial central? → FALSO — classificação invertida.',
          'Julgar II: ausência de pulso pode indicar oclusão arterial? → VERDADEIRO.',
          'Julgar III: avaliar FC + ritmo + força? → VERDADEIRO.',
          'Julgar IV: apical no 3º EIC hemiclavicular? → FALSO — ictus = 5º EIC esquerdo.',
          'Sequência: F, V, V, F.',
          'Eliminar A (II falso), B (I verdadeiro), C (IV verdadeiro).',
          'Marcar D.',
        ],
        footer_rule: 'F, V, V, F → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso e técnica',
        meta: slideMeta,
        content: 'PULSO — CLASSIFICAÇÃO MS',
        rows: [
          { label: 'Pulso central', value: 'Carótida · femoral · aorta', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pulso periférico', value: 'Radial · ulnar · poplítea · tibial posterior', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC apical', value: '5º EIC esquerdo · linha hemiclavicular', sv_kind: 'fc', badge: 'ok' },
          { label: 'Qualidade', value: 'Ritmo + força + frequência', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Não inverta central/periférico nem 3º×5º EIC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SEQUÊNCIA V/F',
        items: [
          {
            label: 'Letra A — F, V, F, V',
            detail: 'Acerta II e IV, erra I e III.',
            correct:
              'Item III sobre ritmo e força é verdadeiro — sequência não fecha; IV apical no 3º EIC é falso, não verdadeiro.',
          },
          {
            label: 'Letra B — V, F, F, V',
            detail: 'Aceita I invertendo central/periférico.',
            correct:
              'Carótida e femoral são pulsos centrais — item I é falso, não verdadeiro.',
          },
          {
            label: 'Letra C — V, F, V, F',
            detail: 'Mantém I falso como verdadeiro e nega III.',
            correct:
              'Avaliação do pulso inclui frequência, ritmo e força — item III é verdadeiro.',
          },
          {
            label: 'Marcar sem julgar IV',
            detail: 'Aluno confirma I–III e chuta a sequência.',
            correct:
              'FC apical no ictus = 5º EIC esquerdo — afirmativa do 3º EIC é falsa e define a letra D.',
          },
        ],
        footer_rule: 'I invertido + apical errado → só D',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344117207-2': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/Potter — artéria carótida: pulso central no pescoço · lateral à traqueia',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso carótida — anatomia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Qual alternativa relaciona corretamente o local de palpação à artéria carótida?',
            icon: 'Target',
          },
          {
            label: 'Carótida',
            detail:
              'Grande artéria cervical — irriga cérebro; pulso central palpado no pescoço.',
            icon: 'HeartPulse',
          },
          {
            label: 'Sítio correto',
            detail: 'Pescoço — lateral à traqueia, abaixo da mandíbula.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — punho',
            detail: 'Letra A: punho = artéria radial, pulso periférico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — virilha',
            detail: 'Letra C: região inguinal = artéria femoral.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Carótida = pescoço (central)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: local de palpação da carótida.',
          'Testar A — punho: radial periférico → eliminar.',
          'Testar B — ausculta cardíaca: técnica de FC apical, não nome do sítio carotídeo → eliminar.',
          'Testar C — região inguinal: femoral → eliminar.',
          'Testar D — pescoço: sítio clássico da carótida → candidata.',
          'Confirmar: pulso central cervical.',
          'Marcar D.',
        ],
        footer_rule: 'Carótida → pescoço → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — locais de pulso',
        meta: slideMeta,
        content: 'CARÓTIDA × OUTROS SÍTIOS',
        rows: [
          { label: 'Artéria carótida', value: 'Pescoço — pulso central', sv_kind: 'fc', badge: 'hot' },
          { label: 'Artéria radial', value: 'Punho — pulso periférico de rotina', sv_kind: 'fc', badge: 'ok' },
          { label: 'Artéria femoral', value: 'Virilha/inguinal — pulso central', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC apical', value: 'Ausculta no ictus — 5º EIC esquerdo', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Nomeie o vaso antes de marcar o sítio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CARÓTIDA',
        items: [
          {
            label: 'Letra A — punho',
            detail: 'Local de palpação do pulso radial.',
            correct:
              'Punho abriga artéria radial — pulso periférico, não carótida cervical.',
          },
          {
            label: 'Letra B — ausculta cardíaca',
            detail: 'Técnica de FC apical com estetoscópio.',
            correct:
              'Ausculta cardíaca mede FC pelo ictus — não descreve o sítio anatômico da carótida no pescoço.',
          },
          {
            label: 'Letra C — região inguinal',
            detail: 'Virilha — artéria femoral.',
            correct:
              'Inguinal/femoral é pulso central de membro inferior — distinto da carótida.',
          },
          {
            label: 'Confundir central com periférico',
            detail: 'Marcar punho por ser o pulso mais aferido.',
            correct:
              'Questão pede especificamente carótida — sítio cervical, não punho.',
          },
        ],
        footer_rule: 'Só pescoço identifica carótida',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344117207-3': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — bradisfigmia: pulso fino (hipocinesia) + bradicardia (<60 bpm) · taquisfigmia: fino + taquicardia (>100)',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia — bradisfigmia',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Qual alternativa define corretamente bradisfigmia — termo que une frequência e qualidade do pulso?',
            icon: 'Target',
          },
          {
            label: 'Bradisfigmia',
            detail:
              'Bradi- (lento) + -sfigmia (pulso): pulso fino associado à bradicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — só FC baixa',
            detail:
              'Letra A cita apenas FC abaixo do normal — omite qualidade (fino) do pulso.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taquicardia',
            detail: 'Letra C: FC acima do normal = taquicardia, não bradisfigmia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — taquisfigmia',
            detail: 'Letra B: pulso fino taquicárdico = taquisfigmia, termo oposto.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Bradisfigmia = fino + bradicárdico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: definição de bradisfigmia.',
          'Decodificar: bradi- = lento · -sfigmia = qualidade do pulso.',
          'Testar A — só FC abaixo do normal: incompleto, falta “fino” → eliminar.',
          'Testar B — fino taquicárdico: taquisfigmia → eliminar.',
          'Testar C — FC acima do normal: taquicardia → eliminar.',
          'Testar D — fino e bradicárdico: une qualidade + FC <60 → candidata.',
          'Confirmar dupla condição frequência + amplitude.',
          'Marcar D.',
        ],
        footer_rule: 'Fino + bradicárdico → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia FC',
        meta: slideMeta,
        content: 'FREQUÊNCIA × QUALIDADE DO PULSO',
        rows: [
          { label: 'Bradicardia', value: 'FC < 60 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradisfigmia', value: 'Pulso fino + bradicardia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC normal adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: '-sfigmia sempre exige qualidade do pulso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BRADISFIGMIA',
        items: [
          {
            label: 'Letra A — FC abaixo do normal',
            detail: 'Define apenas bradicardia numérica.',
            correct:
              'Bradisfigmia exige pulso fino (hipocinesia) associado à bradicardia — frequência isolada não fecha o termo.',
          },
          {
            label: 'Letra B — fino taquicárdico',
            detail: 'Pulso fraco com FC elevada.',
            correct:
              'Combinação descreve taquisfigmia — oposto de bradisfigmia.',
          },
          {
            label: 'Letra C — FC acima do normal',
            detail: 'Taquicardia sem qualificar amplitude.',
            correct:
              'FC >100 bpm = taquicardia — não bradisfigmia.',
          },
          {
            label: 'Ignorar sufixo -sfigmia',
            detail: 'Aluno marca A por ver “bradi” no enunciado.',
            correct:
              'Sufixo -sfigmia refere-se à qualidade/ amplitude do pulso — exige “fino” além da FC baixa.',
          },
        ],
        footer_rule: 'Bradisfigmia = dupla: fino + bradi',
      },
    ],
  },

  'atame-enfermagem-verificacao-de-sinais-vitais-1779343932809-2': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — femoral: face interna da coxa/virilha · braquial: fossa antecubital · poplítea: fossa poplítea · radial: punho',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Artérias — localização para FC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Assinalar afirmativa correta sobre artérias e locais de mensuração da FC.',
            icon: 'Target',
          },
          {
            label: 'Artéria femoral',
            detail:
              'Face interna da coxa, próxima à virilha — pulso central de emergência.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — “fibular” no punho',
            detail: 'Letra B troca fibular (perna) com radial (punho).',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — braquial no tornozelo',
            detail: 'Letra C coloca braquial no maléolo — braquial é antebraço.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — poplítea no pescoço',
            detail: 'Letra D confunde poplítea (joelho) com carótida (pescoço).',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Femoral = virilha · braquial = cotovelo · radial = punho',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: anatomia correta das artérias para FC.',
          'Testar A — femoral na face interna da coxa/virilha: correto → candidata.',
          'Testar B — fibular no punho acima do polegar: fibular é perna; punho = radial → eliminar.',
          'Testar C — braquial no tornozelo/maléolo: braquial é fossa antecubital → eliminar.',
          'Testar D — poplítea no pescoço: poplítea é joelho; pescoço = carótida → eliminar.',
          'Confirmar só A descreve par artéria–região fielmente.',
          'Marcar A.',
        ],
        footer_rule: 'Femoral na virilha → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — artérias palpáveis',
        meta: slideMeta,
        content: 'ONDE PALPAR CADA ARTÉRIA',
        rows: [
          { label: 'Femoral', value: 'Virilha — face interna da coxa', sv_kind: 'fc', badge: 'hot' },
          { label: 'Braquial', value: 'Fossa antecubital — membro superior', sv_kind: 'fc', badge: 'ok' },
          { label: 'Radial', value: 'Punho — face lateral', sv_kind: 'fc', badge: 'ok' },
          { label: 'Poplítea', value: 'Fossa poplítea posterior do joelho', sv_kind: 'fc', badge: 'ok' },
          { label: 'Carótida', value: 'Pescoço — lateral à traqueia', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Associe vaso ao segmento anatômico antes de marcar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA ATAME',
        items: [
          {
            label: 'Letra B — fibular no punho',
            detail: 'Artéria fibular na região do punho.',
            correct:
              'Fibular/peroneal circula na perna — pulso de punho é artéria radial, não fibular.',
          },
          {
            label: 'Letra C — braquial no tornozelo',
            detail: 'Braquial perto do maléolo medial.',
            correct:
              'Artéria braquial situa-se na fossa antecubital do braço — não no tornozelo.',
          },
          {
            label: 'Letra D — poplítea no pescoço',
            detail: 'Poplítea próxima à traqueia.',
            correct:
              'Artéria poplítea passa pela fossa do joelho — pescoço abriga carótida, não poplítea.',
          },
          {
            label: 'Reconhecer só femoral',
            detail: 'Aluno elimina absurdos mas não valida A.',
            correct:
              'Femoral na face interna da coxa junto à virilha é descrição anatômica correta — gabarito A.',
          },
        ],
        footer_rule: 'Trocas anatômicas clássicas → só A sobrevive',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-0': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/SBP — escolar 6–12 anos: FC ~70–110 bpm · FR ~18–25 irpm · 55 bpm = bradicardia · 23 irpm = eupneia pediátrica',
    exam_vs_current: 'Prova usa faixa pediátrica escolar — não aplicar 60–100 adulto isolado',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV pediátrico — classificação',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Criança 8 anos — FC 55 bpm e FR 23 mpm no pronto-atendimento.',
            icon: 'User',
          },
          {
            label: 'FC 55 bpm',
            detail:
              'Abaixo da faixa escolar (~70–110) — classificar bradicardia/bradicárdico.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 23 mpm',
            detail:
              'Dentro da faixa respiratória pediátrica escolar (~18–25) — eupneico.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — faixa adulta',
            detail:
              'Aplicar 60–100 bpm e 12–20 irpm de adulto distorce a leitura pediátrica.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — taquicardia',
            detail: 'FC 55 não é taquicardia — é bradicardia para a idade.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Escolar: FC baixa + FR normal pediátrica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologia correta para FC e FR da criança de 8 anos.',
          'Contexto: usar faixa pediátrica escolar, não só adulto.',
          'Avaliar FC 55 bpm: <70 para escolar → bradicárdico/bradicardia.',
          'Avaliar FR 23 mpm: ~18–25 escolar → eupneico (não taquipneia).',
          'Testar A/B/C — taquicardia ou taquipneia: contradiz os números → eliminar.',
          'Testar D — normocárdico: FC 55 não é normal para 8 anos → eliminar.',
          'Testar E — bradicárdico + eupneico: combinação coerente → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Bradicárdico + eupneico → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escolar 6–12 anos',
        meta: slideMeta,
        content: 'FAIXAS PEDIÁTRICAS — ESCOLAR',
        rows: [
          { label: 'FC escolar', value: '~70 a 110 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR escolar', value: '~18 a 25 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Caso — FC 55', value: 'Bradicardia para escolar', sv_kind: 'fc', badge: 'warn' },
          { label: 'Caso — FR 23', value: 'Eupneia pediátrica', sv_kind: 'fr', badge: 'ok' },
          { label: 'Adulto (contraste)', value: 'FC 60–100 · FR 12–20', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Idade muda o normal — leia o enunciado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PEDIÁTRICO AVANÇASP',
        items: [
          {
            label: 'Letra A — taquicárdico e eupneico',
            detail: 'FC 55 rotulada como taquicardia.',
            correct:
              '55 bpm é abaixo do normal escolar — bradicardia, não taquicardia.',
          },
          {
            label: 'Letra B — taquicardia e taquipneico',
            detail: 'Ambos os parâmetros alterados para cima.',
            correct:
              'FC está baixa e FR 23 é eupneia pediátrica — não há taqui em nenhum dos dois.',
          },
          {
            label: 'Letra C — normocárdico e taquipneico',
            detail: 'FC normal com taquipneia.',
            correct:
              '55 bpm não é normocárdico para 8 anos; FR 23 não configura taquipneia escolar.',
          },
          {
            label: 'Letra D — normocárdico e eupneico',
            detail: 'Aceita FC 55 como normal.',
            correct:
              'Para escolar, 55 bpm é bradicardia — só E une bradicárdico com eupneia coerente.',
          },
        ],
        footer_rule: 'Não transponha faixa adulta ao escolar',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343833455-2': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/SBC — taquisfigmia: pulso fino + taquicardia (>100 bpm) · adulto 35 anos FC 110 + pulso fino',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Taquisfigmia — caso clínico',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Homem 35 anos — FC 110 bpm e pulso fino à palpação no PA.',
            icon: 'User',
          },
          {
            label: 'Taquicardia',
            detail: 'FC 110 bpm > 100 — frequência elevada.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pulso fino',
            detail: 'Amplitude reduzida — hipocinesia/ débito comprometido.',
            icon: 'Activity',
          },
          {
            label: 'Taquisfigmia',
            detail:
              'Termo que une taquicardia + pulso fino — resposta da prova.',
            icon: 'Target',
          },
          {
            label: 'Pegadinha — só taquicardia',
            detail:
              'Letra E cita apenas taquicardia — omite qualidade “fino”.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Fino + taqui = taquisfigmia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologia para FC 110 bpm + pulso fino em adulto.',
          'Avaliar FC: 110 > 100 → taquicardia.',
          'Avaliar qualidade: pulso fino à palpação.',
          'Unir: taqui- + -sfigmia (fino) = taquisfigmia.',
          'Testar A — normocardia: FC alterada → eliminar.',
          'Testar B — bradicardia: FC alta → eliminar.',
          'Testar D — bradisfigmia: fino + bradi — oposto do caso → eliminar.',
          'Testar E — taquicardia: incompleto, falta amplitude → eliminar.',
          'Testar C — taquisfigmia: fino + taquicárdico → candidata.',
          'Marcar C.',
        ],
        footer_rule: '110 bpm fino → taquisfigmia → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia pulso',
        meta: slideMeta,
        content: 'FREQUÊNCIA + AMPLITUDE',
        rows: [
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicardia', sv_kind: 'fc', badge: 'hot' },
          { label: 'Bradisfigmia', value: 'Pulso fino + bradicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC normal adulto', value: '60 a 100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Caso — 110 fino', value: 'Taquisfigmia', sv_kind: 'fc', badge: 'hot' },
        ],
        footer_rule: '-sfigmia = sempre qualidade do pulso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TAQUISFIGMIA',
        items: [
          {
            label: 'Letra A — normocardia',
            detail: 'FC 110 rotulada como normal.',
            correct:
              '110 bpm excede 100 — taquicardia, não normocardia.',
          },
          {
            label: 'Letra B — bradicardia',
            detail: 'FC elevada classificada como bradi.',
            correct:
              'Bradicardia é FC <60 — oposto de 110 bpm.',
          },
          {
            label: 'Letra D — bradisfigmia',
            detail: 'Pulso fino com bradicardia.',
            correct:
              'Caso traz taquicardia (110) — bradisfigmia exige FC baixa.',
          },
          {
            label: 'Letra E — taquicardia',
            detail: 'Só frequência, sem amplitude.',
            correct:
              'Enunciado explicita pulso fino — terminologia completa é taquisfigmia, não taquicardia isolada.',
          },
        ],
        footer_rule: 'Fino + taqui → C, não E',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-3': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/Potter — artéria braquial: fossa antecubital do braço — local de PA e palpação de pulso braquial',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso braquial — mapa anatômico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Imagem com locais numerados de pulso — identificar região do pulso braquial.',
            icon: 'Target',
          },
          {
            label: 'Artéria braquial',
            detail:
              'Fossa antecubital — face anterior do cotovelo; sítio de PA e palpação.',
            icon: 'HeartPulse',
          },
          {
            label: 'Referência visual',
            detail:
              'Na figura AVANÇASP, número 4 corresponde ao antebraço/cotovelo braquial.',
            icon: 'MapPin',
          },
          {
            label: 'Pegadinha — punho',
            detail: 'Números proximais ao punho indicam radial/ulnar, não braquial.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — pescoço/virilha',
            detail: 'Carótida e femoral ficam em regiões distantes do braço.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Braquial = cotovelo (fossa antecubital)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: número da imagem que indica pulso braquial.',
          'Revisar anatomia: braquial passa pela fossa antecubital.',
          'Testar A — indicação 1: região distal/punho, não cotovelo → eliminar.',
          'Testar B — indicação 2: não corresponde à fossa antecubital → eliminar.',
          'Testar C — indicação 3: sítio distinto da braquial na figura → eliminar.',
          'Testar E — indicação 5: outra região anatômica → eliminar.',
          'Testar D — indicação 4: cotovelo/antecubital = braquial → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Braquial na figura → 4 → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pulso braquial',
        meta: slideMeta,
        content: 'BRAQUIAL × OUTROS SÍTIOS',
        rows: [
          { label: 'Artéria braquial', value: 'Fossa antecubital — braço', sv_kind: 'fc', badge: 'hot' },
          { label: 'Artéria radial', value: 'Punho — lateral', sv_kind: 'fc', badge: 'ok' },
          { label: 'Artéria carótida', value: 'Pescoço', sv_kind: 'fc', badge: 'ok' },
          { label: 'Artéria femoral', value: 'Virilha', sv_kind: 'fc', badge: 'ok' },
          { label: 'PA no braço', value: 'Manguito sobre braquial', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Cotovelo = braquial · punho = radial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MAPA DE PULSO',
        items: [
          {
            label: 'Letra A — indicação 1',
            detail: 'Primeiro número na figura.',
            correct:
              'Região 1 não corresponde à fossa antecubital braquial — verifique punho ou outro sítio distal.',
          },
          {
            label: 'Letra B — indicação 2',
            detail: 'Segundo número na ilustração.',
            correct:
              'Posição 2 não marca o cotovelo braquial — braquial exige fossa antecubital (nº 4).',
          },
          {
            label: 'Letra C — indicação 3',
            detail: 'Terceiro ponto numerado.',
            correct:
              'Número 3 não é o sítio clássico da artéria braquial na figura AVANÇASP.',
          },
          {
            label: 'Letra E — indicação 5',
            detail: 'Quinto número na imagem.',
            correct:
              'Indicação 5 aponta região distinta da braquial — gabarito é 4 (cotovelo).',
          },
        ],
        footer_rule: 'Só 4 fecha braquial na figura',
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
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g26] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g26] total=${ok}`);
}

main();
