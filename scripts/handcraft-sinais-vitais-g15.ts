#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g15 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g15
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g15';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-05';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'PA normotenso',
    'técnica de aferição PA',
    'fases de Korotkoff',
    'crise hipertensiva',
    'dupla aferição PA',
    'monitorização SV hemodiálise',
    'classificação clínica multi-SV',
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
  family: 'vf' | 'conceito' | 'protocolo';
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

const ICECE_CRISIS_SLIDES: unknown[] = [
  {
    type: 'concept_map',
    slide_title: 'Crise hipertensiva — PA no PA',
    meta: slideMeta,
    items: [
      {
        label: 'Comando da prova',
        detail: 'PA 180×120 mmHg persistente + cefaleia e visão turva — interpretar e conduta.',
        icon: 'Target',
      },
      {
        label: 'PA 178–180 / 118–120',
        detail: 'Valores muito elevados mesmo após repouso e técnica correta.',
        icon: 'Scale',
      },
      {
        label: 'Sintomas associados',
        detail: 'Cefaleia intensa e visão turva sugerem urgência — não ansiedade isolada.',
        icon: 'AlertTriangle',
      },
      {
        label: 'Pegadinha — classificar errado',
        detail: 'Letra A trata hipertensão grave como estágio 1 — erro de interpretação normo/hiper/hipo.',
        icon: 'TrendingUp',
      },
      {
        label: 'Pegadinha — sem comunicar',
        detail: 'Letra D adia conduta — técnico deve comunicar alteração de SV imediatamente.',
        icon: 'AlertTriangle',
      },
    ],
    footer_rule: 'PA muito alta + sintomas = comunicar equipe imediatamente',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Cenário: diabético hipertenso · PA 180×120 → 178×118 após 5 min repouso · cefaleia · visão turva.',
      'Técnica correta e repouso confirmados — valor não é artefato de ansiedade.',
      'PA ≥ 180/120 com sintomas → crise hipertensiva (urgência).',
      'Testar A — estágio 1 ambulatorial: subestima gravidade e sintomas → eliminar.',
      'Testar C — desconsiderar por ansiedade: PA persiste após repouso → eliminar.',
      'Testar D — três aferições em dias diferentes: inaceitável no pronto atendimento → eliminar.',
      'Conduta: comunicar enfermagem + monitorizar → letra B.',
      'Marcar B.',
    ],
    footer_rule: 'Crise hipertensiva + comunicação imediata → B',
  },
  {
    type: 'golden_rule',
    slide_title: 'Referência — PA e urgência',
    meta: slideMeta,
    content: 'CLASSIFICAÇÃO E CONDUTA — ADULTO',
    rows: [
      { label: 'PA 180×120 mmHg', value: 'Hipertensão grave / crise', sv_kind: 'pa', badge: 'hot' },
      { label: 'Repouso 5 min', value: 'Confirma persistência — não artefato', sv_kind: 'pa', badge: 'ok' },
      { label: 'Sintomas', value: 'Cefaleia + visão turva = urgência', sv_kind: 'pa', badge: 'warn' },
      { label: 'HAS estágio 1', value: '140–159/90–99 — conduta ambulatorial', sv_kind: 'pa', badge: 'ok' },
      { label: 'Técnico de Enfermagem', value: 'Comunicar achado + monitorizar', sv_kind: 'meta', badge: 'hot' },
    ],
    footer_rule: 'Crise ≠ estágio 1 ambulatorial',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — CRISE HIPERTENSIVA ICECE',
    items: [
      {
        label: 'Letra A — hipertensão estágio 1 ambulatorial',
        detail: 'Orienta retorno em 30 dias sem tratar urgência.',
        correct: '180×120 com cefaleia e visão turva é crise — não HAS estágio 1 de rotina ambulatorial.',
      },
      {
        label: 'Letra C — desconsiderar por ansiedade',
        detail: 'Atribui elevação apenas ao estado emocional.',
        correct: 'PA manteve-se 178×118 após repouso e técnica correta — não pode ser ignorada.',
      },
      {
        label: 'Letra D — confirmar em três dias',
        detail: 'Adia conduta para confirmação ambulatorial.',
        correct: 'No pronto atendimento com sintomas neurológicos, exige comunicação imediata — não esperar dias.',
      },
    ],
    footer_rule: 'Comunicar equipe + monitorizar → B',
  },
];

const SPECS: Record<string, Pack> = {
  'icece-enfermagem-verificacao-de-sinais-vitais-1778969729218-3': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/SBC — PA ≥ 180/120 com sintomas = crise hipertensiva · comunicar equipe · monitorizar · não adiar conduta',
    roi_error: 'conduta_sem_escalonar',
    slides: ICECE_CRISIS_SLIDES,
  },

  'icece-enfermagem-verificacao-de-sinais-vitais-1780000468214-6': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/SBC — PA ≥ 180/120 com sintomas = crise hipertensiva · comunicar equipe · monitorizar · não adiar conduta',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urgência hipertensiva — CPSMQ',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Interpretar PA persistente e definir conduta no pronto atendimento.',
            icon: 'Target',
          },
          {
            label: 'Dupla aferição',
            detail: '180×120 → 178×118 após repouso — confirma hipertensão grave.',
            icon: 'Scale',
          },
          {
            label: 'Sinais de alarme',
            detail: 'Cefaleia intensa e visão turva — não são “só ansiedade”.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — adiar diagnóstico',
            detail: 'Letra D exige três aferições em dias diferentes.',
            icon: 'Clock',
          },
        ],
        footer_rule: 'Sintomas + PA muito alta = escalonar cuidado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Paciente 62 anos · DM + HAS · PA elevada com sintomas neurológicos.',
          'Repouso 5 min + manguito adequado — PA permanece alterada.',
          'Classificar: crise hipertensiva (não estágio 1 nem artefato).',
          'Eliminar A — conduta ambulatorial tardia.',
          'Eliminar C — ansiedade não explica persistência pós-repouso.',
          'Eliminar D — confirmação em dias diferentes é inadequada na urgência.',
          'Comunicar enfermagem + monitorização contínua.',
          'Marcar B.',
        ],
        footer_rule: 'Escalonar cuidado imediato → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — crise × rotina',
        meta: slideMeta,
        content: 'PA ELEVADA NO PA',
        rows: [
          { label: 'Crise hipertensiva', value: 'PA muito alta + sintomas — urgência', sv_kind: 'pa', badge: 'hot' },
          { label: 'Repouso', value: '5 min antes de reaferir — padrão MS', sv_kind: 'pa', badge: 'ok' },
          { label: 'Estágio 1', value: 'Conduta ambulatorial — não aplicável aqui', sv_kind: 'pa', badge: 'warn' },
          { label: 'Conduta técnico', value: 'Comunicar + monitorizar SV', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Não minimizar PA com sintomas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA NO PA',
        items: [
          {
            label: 'Letra A — retorno ambulatorial em 30 dias',
            detail: 'Trata quadro agudo como seguimento eletivo.',
            correct: 'Cefaleia e visão turva com PA 180×120 exigem ação imediata — não agendar consulta.',
          },
          {
            label: 'Letra C — atribuir à ansiedade',
            detail: 'Desconsidera valores após técnica e repouso adequados.',
            correct: 'PA confirmada após 5 min de repouso não pode ser descartada como ansiedade isolada.',
          },
          {
            label: 'Letra D — três aferições em dias distintos',
            detail: 'Protocolo de ambulatório aplicado à urgência.',
            correct: 'No PA, alteração grave com sintomas demanda comunicação imediata — não adiar.',
          },
        ],
        footer_rule: 'Crise hipertensiva → comunicar → B',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712108887-9': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA pode ser aferida duas vezes com intervalo entre medidas · pulso apical obrigatório em arritmia',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Protocolo SV — descontrole metabólico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre aferição de SV e glicemia no contexto clínico.',
            icon: 'Target',
          },
          {
            label: 'Dupla aferição PA',
            detail: 'Duas medidas com intervalo entre elas aumenta acurácia — alternativa C.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — FR 30 s',
            detail: 'Letra A mistura oximetria com contagem parcial de FR.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — pulso apical',
            detail: 'Letra D dispensa apical em arritmia — técnica errada.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'PA dupla + intervalo = técnica MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: protocolo correto de aferição SV/glicemia.',
          'Testar A — FR 30 s + oximetria: contagem incompleta → eliminar.',
          'Testar B — glicemia só em jejum noturno: restringe indevidamente → eliminar.',
          'Testar C — PA duas vezes com intervalo entre medidas: técnica MS → candidata.',
          'Testar D — dispensar pulso apical em arritmia: incorreto → eliminar.',
          'Testar E — não descartar 1ª gota glicemia: técnica errada → eliminar.',
          'Confirmar: única assertiva técnica correta é C.',
          'Marcar C.',
        ],
        footer_rule: 'Dupla PA com intervalo → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA e pulso',
        meta: slideMeta,
        content: 'AFERIÇÃO PADRONIZADA',
        rows: [
          { label: 'PA dupla', value: 'Duas medidas · intervalo entre aferições', sv_kind: 'pa', badge: 'hot' },
          { label: 'FR', value: 'Contar 1 min completo — não 30 s', sv_kind: 'fr', badge: 'ok' },
          { label: 'Arritmia', value: 'Pulso apical 60 s — não dispensar', sv_kind: 'fc', badge: 'hot' },
          { label: 'Glicemia capilar', value: 'Descartar 1ª gota · repetir se muito alta', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Dupla PA com intervalo confirma leitura fidedigna',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROTOCOLO IDECAN',
        items: [
          {
            label: 'Letra A — FR em 30 segundos',
            detail: 'Reduz tempo de observação respiratória.',
            correct: 'FR exige contagem de 1 minuto completo — 30 s subestima ou superestima o valor.',
          },
          {
            label: 'Letra B — glicemia só em jejum',
            detail: 'Limita monitorização do diabético.',
            correct: 'Glicemia capilar não se restringe ao jejum — monitorização conforme protocolo.',
          },
          {
            label: 'Letra D — dispensar pulso apical',
            detail: 'Ignora avaliação em arritmia.',
            correct: 'Arritmia ou instabilidade exige pulso apical 60 s — radial isolado é insuficiente.',
          },
          {
            label: 'Letra E — não descartar 1ª gota',
            detail: 'Técnica de glicemia capilar incorreta.',
            correct: 'Primeira gota deve ser descartada — técnica padrão de hemoglicoteste.',
          },
        ],
        footer_rule: 'PA 2× com intervalo → C',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712135178-0': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/COFEN — FC adulto em repouso 60–100 bpm · normocárdico na faixa',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC normal — enfermaria UFOB',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Durante avaliação rotineira em enfermaria — técnico mede frequência cardíaca em repouso com boa perfusão sem complicações cardíacas.',
            icon: 'Target',
          },
          {
            label: 'Faixa MS',
            detail: 'Adulto saudável em repouso: 60–100 bpm — normocárdico.',
            icon: 'HeartPulse',
          },
          {
            label: 'Valor da prova',
            detail: 'Alternativa B está dentro da faixa normocárdica em repouso.',
            icon: 'CheckCircle',
          },
          {
            label: 'Pegadinha — bradicardia',
            detail: 'Alternativas A e E estão abaixo de 60 — bradicardia.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — taquicardia',
            detail: 'Alternativas C e D excedem 100 — taquicardia.',
            icon: 'TrendingUp',
          },
        ],
        footer_rule: '60–100 bpm = normocárdico no adulto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: FC normal em adulto saudável em repouso na enfermaria.',
          'Referência MS: normocárdico = 60–100 bpm.',
          'Testar A — quarenta e cinco: abaixo de 60 → bradicardia → eliminar.',
          'Testar B — valor dentro da faixa normocárdica → candidata.',
          'Testar C — cento e vinte: acima de 100 → taquicardia → eliminar.',
          'Testar D — cento e trinta: taquicardia → eliminar.',
          'Testar E — cinquenta: bradicardia → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Normocárdico em repouso → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas FC adulto',
        meta: slideMeta,
        content: 'FREQUÊNCIA CARDÍACA — REPOUSO',
        rows: [
          { label: 'Normocárdico', value: '60–100 bpm em repouso', sv_kind: 'fc', badge: 'hot' },
          { label: 'Caso da prova', value: 'Dentro da faixa — alternativa B', sv_kind: 'fc', badge: 'ok' },
          { label: 'Abaixo de 60', value: 'Bradicardia', sv_kind: 'fc', badge: 'warn' },
          { label: 'Acima de 100', value: 'Taquicardia', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'Compare o valor com 60 e 100 antes de marcar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXA FC IDECAN',
        items: [
          {
            label: 'Letra A — bradicardia grave',
            detail: 'Valor muito abaixo do limite inferior.',
            correct: 'Quarenta e cinco batimentos configura bradicardia — não é normalidade em repouso.',
          },
          {
            label: 'Letra C — taquicardia',
            detail: 'FC acelerada além do teto normal.',
            correct: 'Cento e vinte batimentos excede 100 — fora da faixa pedida no enunciado.',
          },
          {
            label: 'Letra D — taquicardia acentuada',
            detail: 'Taquicardia moderada a acentuada.',
            correct: 'Cento e trinta batimentos excede o teto normocárdico — não representa FC normal em repouso.',
          },
          {
            label: 'Letra E — bradicardia leve',
            detail: 'Bradicardia leve.',
            correct: 'Cinquenta batimentos está abaixo de 60 — não é valor normal para adulto em repouso.',
          },
        ],
        footer_rule: 'Único valor na faixa 60–100 → B',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712135178-1': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'COFEN — técnico aferir SV · comunicar achados · instituir ações · técnica PA importa',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Papel do técnico — SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre verificação de sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Competência do técnico',
            detail: 'Aferir · comunicar · agir conforme achado — alternativa D.',
            icon: 'UserCheck',
          },
          {
            label: 'Pegadinha — SV só admissão/alta',
            detail: 'Letra B restringe monitorização a dois momentos.',
            icon: 'Calendar',
          },
          {
            label: 'Pegadinha — técnica PA irrelevante',
            detail: 'Letra E nega impacto da técnica na avaliação.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'SV dinâmicos · técnico habilitado · comunicar achados',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre SV.',
          'Testar A — temperatura só endócrino: ignora hipotálamo e ambiente → eliminar.',
          'Testar B — SV só admissão/alta: monitorização contínua necessária → eliminar.',
          'Testar C — SV estáticos: variam ao longo do dia → eliminar.',
          'Testar E — PA sem técnica: falso — técnica altera resultado → eliminar.',
          'Testar D — habilitado aferir, comunicar e agir: COFEN → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Aferir + comunicar + agir → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — papel e técnica',
        meta: slideMeta,
        content: 'TÉCNICO DE ENFERMAGEM · SV',
        rows: [
          { label: 'Competência', value: 'Aferir SV · comunicar · instituir ações', sv_kind: 'meta', badge: 'hot' },
          { label: 'Frequência', value: 'Rotina contínua — não só admissão/alta', sv_kind: 'meta', badge: 'ok' },
          { label: 'Variação', value: 'SV mudam com hora, esforço, medicação', sv_kind: 'meta', badge: 'ok' },
          { label: 'Técnica PA', value: 'Posição e manguito alteram leitura', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Comunicar alteração é parte do cuidado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAPEL DO TÉCNICO',
        items: [
          {
            label: 'Letra A — temperatura só endócrino',
            detail: 'Nega influência de ambiente e emoções.',
            correct: 'Termorregulação envolve hipotálamo, ambiente e estado emocional — não é exclusiva do endócrino.',
          },
          {
            label: 'Letra B — SV só na admissão e alta',
            detail: 'Elimina monitorização seriada.',
            correct: 'SV devem ser verificados conforme rotina e gravidade — não apenas na entrada e saída.',
          },
          {
            label: 'Letra C — SV estáticos',
            detail: 'Nega variação fisiológica diária.',
            correct: 'FC, PA e temperatura variam com atividade, horário e medicação ao longo do dia.',
          },
          {
            label: 'Letra E — técnica PA irrelevante',
            detail: 'Minimiza posicionamento e manguito.',
            correct: 'Braço, pernas cruzadas e manguito inadequado falsificam PA — técnica é essencial.',
          },
        ],
        footer_rule: 'Habilitado + comunicar → D',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712135178-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — hemodiálise: monitorar SV antes, durante e após · hipotensão intradialítica',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IRC em hemodiálise — monitor SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Insuficiência renal crônica em hemodiálise — ação prioritária de enfermagem para evitar complicações na sessão.',
            icon: 'Target',
          },
          {
            label: 'Monitorização SV',
            detail: 'Antes · durante · após diálise — detecta hipotensão e complicações.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — só peso pré',
            detail: 'Letra B limita avaliação ao peso antes da sessão.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — trocar cateter',
            detail: 'Letra C propõe troca de cateter a cada sessão.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'SV seriados na hemodiálise = prioridade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: insuficiência renal crônica · terapia de substituição renal · hemodiálise.',
          'Equipe de enfermagem monitora complicações na sessão de diálise.',
          'Testar A — orientação nutricional: importante, mas não é ação prioritária imediata → eliminar.',
          'Testar B — só peso pré: incompleto — ignora SV intradialíticos → eliminar.',
          'Testar C — trocar cateter cada sessão: conduta incorreta → eliminar.',
          'Testar E — diuréticos rotineiros: não é prioridade na sessão → eliminar.',
          'Testar D — monitorar SV antes/durante/após: padrão MS → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Monitor SV na diálise → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cuidado na HD',
        meta: slideMeta,
        content: 'HEMODIÁLISE · SINAIS VITAIS',
        rows: [
          { label: 'Monitorização', value: 'SV antes · durante · após sessão', sv_kind: 'meta', badge: 'hot' },
          { label: 'Peso pré-HD', value: 'Ultrafiltração — complementa, não substitui SV', sv_kind: 'meta', badge: 'ok' },
          { label: 'Hipotensão', value: 'Complicação frequente intradialítica', sv_kind: 'pa', badge: 'warn' },
          { label: 'Cateter', value: 'Não trocar a cada sessão — manter assepsia', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'PA e FC caem na HD — monitorar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IRC / HEMODIÁLISE',
        items: [
          {
            label: 'Letra A — orientação nutricional',
            detail: 'Conduta educativa de médio prazo.',
            correct: 'Nutrição é relevante na IRC, mas a prioridade na sessão é monitorar SV para prevenir colapso.',
          },
          {
            label: 'Letra B — apenas peso pré-sessão',
            detail: 'Reduz avaliação ao ganho hídrico.',
            correct: 'Peso pré é necessário, mas SV durante a HD detectam hipotensão — não substituem monitorização.',
          },
          {
            label: 'Letra C — trocar cateter cada sessão',
            detail: 'Procedimento invasivo desnecessário.',
            correct: 'Cateter de HD não é trocado rotineiramente — risco de infecção e trauma vascular.',
          },
          {
            label: 'Letra E — diuréticos rotineiros',
            detail: 'Fármaco inadequado para anúrico em HD.',
            correct: 'Paciente em HD geralmente não produz urina residual — diurético não é ação prioritária na sessão.',
          },
        ],
        footer_rule: 'SV seriados → D',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712135178-4': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — FC normocárdico 60–100 · FR 11 eupneia · PA 120×80 normotenso · hemoglicoteste alto = hiperglicemia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — indicadores de saúde',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Sinais vitais indicam estado de saúde e comunicação universal sobre gravidade da enfermidade.',
            icon: 'Target',
          },
          {
            label: 'FC da prova',
            detail: 'Frequência cardíaca dentro de 60–100 bpm = normocárdico → alternativa C.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — glicemia elevada',
            detail: 'Letra A chama hemoglicoteste muito alto em jejum de euglicemia.',
            icon: 'Droplet',
          },
          {
            label: 'Pegadinha — FR 11 taquipneia',
            detail: 'Letra B classifica FR normal como taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — PA 120×80 hipertensão',
            detail: 'Letra D eleva PA limítrofe a hipertensão.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Julgar cada parâmetro antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa com classificação SV correta.',
          'Testar A — hemoglicoteste muito elevado chamado de euglicemia: valor alto → eliminar.',
          'Testar B — FR 11 taquipneica: 11 < 12 = bradipneia leve, não taquipneia → eliminar.',
          'Testar C — frequência cardíaca normocárdica: dentro de 60–100 bpm → candidata.',
          'Testar D — PA 120×80 hipertensa: limítrofe/normal, não hipertensão → eliminar.',
          'Confirmar: única classificação correta é C.',
          'Marcar C.',
        ],
        footer_rule: 'FC normocárdica na faixa 60–100 → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO POR PARÂMETRO',
        rows: [
          { label: 'FC normocárdica', value: '60–100 bpm — alternativa C correta', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 11 irpm', value: 'Eupneia leve (12–20) — não taquipneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA 120×80', value: 'Normal / limítrofe — não hipertensão', sv_kind: 'pa', badge: 'ok' },
          { label: 'Hemoglicoteste alto', value: 'Hiperglicemia — não euglicemia', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Cada letra erra um parâmetro diferente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MULTI-SV IDECAN',
        items: [
          {
            label: 'Letra A — hemoglicoteste euglicêmico',
            detail: 'Classifica hiperglicemia como normal.',
            correct: 'Hemoglicoteste muito elevado em jejum é hiperglicemia — não euglicemia.',
          },
          {
            label: 'Letra B — FR 11 taquipneica',
            detail: 'Eleva FR abaixo de 12 a taquipneia.',
            correct: '11 irpm está abaixo de 12 — seria bradipneia leve, não taquipneia (> 20).',
          },
          {
            label: 'Letra D — PA 120×80 hipertensa',
            detail: 'Sobreclassifica pressão limítrofe.',
            correct: '120×80 mmHg enquadra normal/limítrofe na SBC — não hipertensão estágio 1.',
          },
        ],
        footer_rule: 'Só C classifica FC corretamente',
      },
    ],
  },

  'idecan-enfermagem-verificacao-de-sinais-vitais-1778712135178-5': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — Korotkoff I = aparecimento = PAS · Korotkoff V = desaparecimento = PAD · pulso radial pré-PA',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — Korotkoff',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Item correto sobre técnica de medida da pressão arterial.',
            icon: 'Target',
          },
          {
            label: 'Fase I — aparecimento',
            detail: 'Primeiro som audível = pressão sistólica → alternativa B.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — pulso apical',
            detail: 'Letra A usa apical para pré-inflação — padrão é radial.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — fase V sistólica',
            detail: 'Letra C atribui desaparecimento dos sons à sistólica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — membro com fístula',
            detail: 'Letra D aferir em membro com fístula — contraindicado.',
            icon: 'Ban',
          },
        ],
        footer_rule: '1º som = sistólica · desaparecimento = diastólica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: técnica correta de medida da PA.',
          'Testar A — pulso apical pré-inflação: técnica padrão usa radial → eliminar.',
          'Testar B — fase I = aparecimento dos sons = PAS: MS → candidata.',
          'Testar C — fase V = sistólica: inverte fases → eliminar.',
          'Testar D — PA em membro com fístula: contraindicado → eliminar.',
          'Confirmar sequência Korotkoff.',
          'Marcar B.',
        ],
        footer_rule: 'Aparecimento dos sons → PAS → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff MS',
        meta: slideMeta,
        content: 'FASES · TÉCNICA',
        rows: [
          { label: 'Fase I', value: 'Aparecimento dos sons = pressão sistólica', sv_kind: 'pa', badge: 'hot' },
          { label: 'Fase V', value: 'Desaparecimento dos sons = pressão diastólica', sv_kind: 'pa', badge: 'hot' },
          { label: 'PA — pré-inflação radial', value: 'Inflar 20–30 mmHg acima do desaparecimento do pulso', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA — membro', value: 'Evitar fístula · cateter · plegia no mesmo braço', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Sistólica no 1º som — não no silêncio final',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KOROTKOFF IDECAN',
        items: [
          {
            label: 'Letra A — pulso apical pré-inflação',
            detail: 'Usa local errado para estimar sistólica.',
            correct: 'Pré-inflação padrão: palpar pulso radial e inflar 20–30 mmHg acima do desaparecimento.',
          },
          {
            label: 'Letra C — fase V = sistólica',
            detail: 'Confunde fase de desaparecimento com aparecimento.',
            correct: 'Fase V marca diastólica (desaparecimento) — sistólica é fase I (aparecimento).',
          },
          {
            label: 'Letra D — PA em membro com fístula',
            detail: 'Aferir no braço com acesso hemodinâmico.',
            correct: 'Membro com fístula AV, cateter ou plegia é contraindicado para manguito — risco de trombose.',
          },
        ],
        footer_rule: 'Fase I = PAS → B',
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
    console.log(`[handcraft:sv-g15] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g15] total=${ok}`);
}

main();
