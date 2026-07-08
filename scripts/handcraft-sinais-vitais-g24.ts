#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g24 (8 slugs P0 vitals_pa_tecnica pos 185–192).
 *
 *   npm run handcraft:sinais-vitais-g24
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g24';
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
    'PA normotenso',
    'técnica de aferição PA',
    'repouso pré-PA 5 min',
    'artéria braquial sob manguito',
    'PA ortostática',
    'manobra de Osler',
    'digoxina e pulso',
    'materiais esfigmomanômetro',
    'classificação terminológica SV',
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

const SPECS: Record<string, Pack> = {
  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343904263-3': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — repouso ≥5 min sentado em ambiente silencioso antes da PA · braço na altura do coração · deflação lenta · estetoscópio sem pressão excessiva',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA fidedigna — repouso pré-aferição',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Ao mensurar PA em adulto hipertenso, qual conduta o técnico deve adotar — assinalar a correta.',
            icon: 'Target',
          },
          {
            label: 'Repouso 5 min',
            detail:
              'Sentado confortavelmente em ambiente silencioso por cinco minutos antes de iniciar — letra A.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — braço abaixo do coração',
            detail:
              'Letra C: braço apoiado abaixo do nível cardíaco — eleva artificialmente a PA.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — estetoscópio firme',
            detail:
              'Letra E: pressionar demais o estetoscópio — distorce ausculta dos Korotkoff.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Cuidados válidos mas não gabarito',
            detail:
              'Letras B e D descrevem cuidados MS reais — tabaco/álcool e deflação lenta — porém a banca marca o repouso.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Repouso 5 min silencioso → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta correta ao mensurar PA em adulto hipertenso.',
          'Contexto: medidas fidedignas exigem preparo padronizado MS/SBC.',
          'Testar A — repouso 5 min sentado silencioso: protocolo MS → candidata.',
          'Testar B — evitar fumo/álcool 15 min: cuidado válido, não é a assertiva marcada → eliminar.',
          'Testar C — braço abaixo do coração: posição errada → eliminar.',
          'Testar D — deflação lenta: técnica correta, mas não é o gabarito desta questão → eliminar.',
          'Testar E — estetoscópio pressionado firmemente: técnica inadequada → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Repouso pré-PA → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo pré-PA',
        meta: slideMeta,
        content: 'DECORE — ANTES DE MEDIR',
        rows: [
          { label: 'Repouso', value: '≥5 min sentado · ambiente calmo · sem falar', sv_kind: 'pa', badge: 'hot' },
          { label: 'Braço', value: 'Na altura do coração — nunca abaixo', sv_kind: 'pa', badge: 'ok' },
          { label: 'Estetoscópio', value: 'Leve sobre a fossa antecubital — sem pressionar', sv_kind: 'pa', badge: 'ok' },
          { label: 'Deflação', value: 'Lenta e constante após diastólica', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Silêncio + repouso = base da PA fidedigna',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-PA VUNESP',
        items: [
          {
            label: 'Letra B — fumo/álcool 15 min',
            detail: 'Evitar tabaco e bebida alcoólica nos últimos 15 minutos.',
            correct:
              'É cuidado recomendado evitar tabaco e álcool antes da PA — porém a banca marca o repouso de 5 min como assertiva correta desta questão.',
          },
          {
            label: 'Letra C — braço abaixo do coração',
            detail: 'Membro apoiado abaixo do nível cardíaco.',
            correct:
              'Braço abaixo do coração eleva a leitura da PA — posição correta é na altura do coração, não inferior.',
          },
          {
            label: 'Letra D — deflação lenta',
            detail: 'Desinflar bem lentamente para precisão.',
            correct:
              'Deflação lenta é técnica correta, porém o comando pede a conduta que o técnico deve adotar — gabarito é o repouso prévio de 5 minutos.',
          },
          {
            label: 'Letra E — estetoscópio firme',
            detail: 'Pressionar bastante o estetoscópio sob o manguito.',
            correct:
              'Pressão excessiva no estetoscópio abafa os sons Korotkoff — deve-se apoiar levemente na fossa antecubital.',
          },
        ],
        footer_rule: 'Só A fecha o repouso exigido',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343904263-4': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'COFEN/MS — digoxina: verificar pulso antes de administrar · FC < 60 bpm → suspender dose e comunicar enfermeiro/médico',
    exam_vs_current:
      'Prova cobra pulso, não PA, como parâmetro de segurança digitálica — bradicardia contraindica administração',
    roi_error: 'sv_faixas_invertidas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Digoxina VO — checagem de pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Paciente com insuficiência cardíaca — administrar digoxina VO: conduta do técnico de enfermagem.',
            icon: 'Target',
          },
          {
            label: 'Pulso < 60 bpm',
            detail:
              'Não administrar e informar o fato imediatamente — letra E.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — PA como critério',
            detail:
              'Letras B e C: usam pressão arterial — digoxina exige avaliação do pulso, não da PA.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — lógica invertida',
            detail:
              'Letra D: só administrar se pulso < 60 — inverte a regra de segurança.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — intoxicação',
            detail:
              'Letra A: foca sinais de intoxicação — checagem prévia é do pulso, não da confusão mental.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Digoxina → pulso antes · FC < 60 = não dar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preparar digoxina VO em paciente com IC.',
          'Regra de segurança: verificar pulso (FC) antes de cada dose.',
          'FC < 60 bpm → suspender administração e comunicar equipe.',
          'Testar A — sinais de intoxicação: monitoramento distinto da checagem pré-dose → eliminar.',
          'Testar B e C — PA sistólica/diastólica: parâmetro errado para digoxina → eliminar.',
          'Testar D — só dar se pulso < 60: inverte a lógica → eliminar.',
          'Testar E — pulso < 60: não administrar e informar → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Pulso < 60 → suspender → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — digoxina e FC',
        meta: slideMeta,
        content: 'CHECAGEM PRÉ-DOSE',
        rows: [
          { label: 'Parâmetro', value: 'Pulso (FC) — não PA isolada', sv_kind: 'fc', badge: 'hot' },
          { label: 'Limite', value: 'FC < 60 bpm → não administrar', sv_kind: 'fc', badge: 'hot' },
          { label: 'Conduta', value: 'Informar enfermeiro/médico imediatamente', sv_kind: 'meta', badge: 'ok' },
          { label: 'Bradicardia', value: '< 60 bpm em adulto — risco digitálico', sv_kind: 'fc', badge: 'warn' },
        ],
        footer_rule: 'PA não substitui pulso na digoxina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIGOXINA VUNESP',
        items: [
          {
            label: 'Letra A — intoxicação digitálica',
            detail: 'Observar confusão, taquicardia e cãibras.',
            correct:
              'Intoxicação é complicação tardia — a checagem imediata antes da dose é do pulso, não dos sinais neurológicos.',
          },
          {
            label: 'Letra B — PA sistólica ≥ 100',
            detail: 'Só administrar se sistólica ≥ 100 mmHg.',
            correct:
              'Digoxina não tem critério de segurança baseado em pressão sistólica — o parâmetro é a frequência cardíaca/pulso.',
          },
          {
            label: 'Letra C — PA diastólica < 80',
            detail: 'Não dar se diastólica < 80 mmHg.',
            correct:
              'Diastólica não orienta suspensão digitálica — bradicardia (pulso < 60) é o limiar cobrado em prova.',
          },
          {
            label: 'Letra D — só dar se pulso < 60',
            detail: 'Administrar apenas com pulso abaixo de 60.',
            correct:
              'Inverte a regra — pulso abaixo de 60 contraindica a dose; acima de 60 permite administrar após checagem.',
          },
        ],
        footer_rule: 'Checagem de pulso → E',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779343904263-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — PA ortostática: sentado → em pé · queda ≥ 20 mmHg PAS ao levantar · rastrear em hipertensos e diabéticos',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA sentado e em pé — idoso DM+HAS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'J.R., 72 anos, hipertenso e diabético — PA sentada, depois em pé no protocolo ortostático: objetivo da técnica.',
            icon: 'Target',
          },
          {
            label: 'Sequência do caso',
            detail:
              'Pré-consulta: sentado → em pé em intervalos do protocolo MS — mesmo braço.',
            icon: 'Clock',
          },
          {
            label: 'Objetivo clínico',
            detail: 'Verificar hipotensão ortostática — letra A.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — pseudohipertensão',
            detail:
              'Letra B: artérias calcificadas no idoso — técnica distinta (manobra de Osler).',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — avental branco',
            detail: 'Letra C: PA elevada no consultório — não explica medição serial postural.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mudança postural → hipotensão ortostática',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: propósito da PA sentada + em pé em idoso HAS/DM na UBS.',
          'Contexto: risco de queda de PA ao levantar — protocolo MS de ortostatismo.',
          'Testar A — hipotensão ortostática: queda PA em pé → candidata.',
          'Testar B — pseudohipertensão: artéria rígida no idoso → eliminar.',
          'Testar C — hipertensão do avental branco: ansiedade no consultório → eliminar.',
          'Testar D — efeito de mascaramento: normotensão no consultório → eliminar.',
          'Testar E — hipertensão secundária: causa orgânica distinta → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Ortostatismo → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA ortostática',
        meta: slideMeta,
        content: 'RASTREIO POSTURAL MS',
        rows: [
          { label: 'Protocolo', value: 'Sentado → em pé — ortostatismo MS', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hipotensão ortostática', value: 'Queda ≥ 20 PAS ou ≥ 10 PAD ao levantar', sv_kind: 'pa', badge: 'ok' },
          { label: 'População', value: 'Idosos · hipertensos · diabéticos', sv_kind: 'meta', badge: 'ok' },
          { label: 'Pseudohipertensão', value: 'Manobra de Osler — outro fenômeno geriátrico', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Grupos de risco → medir sentado e em pé',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ORTOSTÁTICA VUNESP',
        items: [
          {
            label: 'Letra B — pseudohipertensão',
            detail: 'Artérias calcificadas dificultam aferição.',
            correct:
              'Pseudohipertensão exige manobra de Osler em artéria rígida — não explica medição serial sentado/em pé.',
          },
          {
            label: 'Letra C — hipertensão do avental branco',
            detail: 'PA elevada só no ambiente clínico.',
            correct:
              'Avental branco descreve ansiedade no consultório — aqui a técnica compara PA em diferentes posições corporais.',
          },
          {
            label: 'Letra D — efeito de mascaramento',
            detail: 'PA normal no consultório mascarando HAS.',
            correct:
              'Mascaramento é normotensão no consultório com hipertensão fora — não justifica aferição em pé após sentado.',
          },
          {
            label: 'Letra E — hipertensão secundária',
            detail: 'HAS por causa orgânica identificável.',
            correct:
              'Hipertensão secundária é diagnóstico etiológico — o protocolo postural rastreia queda hemodinâmica ao levantar.',
          },
        ],
        footer_rule: 'Queda postural → A',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344089179-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — manguito sobre artéria braquial centralizada · poplítea/femoral/carótida/basílica não são sítios de PA braquial',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Artéria braquial — PA no braço',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Dimensionar manguito e palpar o pulso na artéria correta antes da ausculta PA no membro superior.',
            icon: 'Target',
          },
          {
            label: 'Sítio correto',
            detail:
              'Artéria braquial na fossa antecubital — manguito comprime esse vaso.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — poplítea',
            detail: 'Letra A: fossa poplítea — membro inferior.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — carótida',
            detail: 'Letra C: pulso cervical — técnica distinta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — basílica',
            detail: 'Letra E: vaso profundo do braço — não é o padrão de PA auscultatória.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'PA no braço = artéria braquial',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: artéria a palpar antes de auscultar PA no membro superior.',
          'Lembrar: esfigmomanômetro comprime artéria braquial na fossa antecubital.',
          'Testar A — poplítea: joelho, membro inferior → eliminar.',
          'Testar B — femoral: virilha → eliminar.',
          'Testar C — carótida: pescoço → eliminar.',
          'Testar D — braquial: sítio padrão → candidata.',
          'Testar E — basílica: vaso profundo, não padrão → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'Braquial sob manguito → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — artérias e PA',
        meta: slideMeta,
        content: 'DECORE — ONDE MEDIR PA NO BRAÇO',
        rows: [
          { label: 'Artéria alvo', value: 'Braquial — fossa antecubital', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: 'Bexiga centralizada sobre a braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Poplítea/femoral', value: 'Membros inferiores — outro contexto', sv_kind: 'meta', badge: 'warn' },
          { label: 'Basílica', value: 'Vaso profundo — não substitui braquial na PA', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Palpar braquial antes de insuflar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ARTÉRIA VUNESP',
        items: [
          {
            label: 'Letra A — poplítea',
            detail: 'Artéria da fossa poplítea.',
            correct:
              'Poplítea fica no joelho — aferição de PA no braço exige artéria braquial centralizada sob o manguito.',
          },
          {
            label: 'Letra B — femoral',
            detail: 'Artéria da virilha.',
            correct:
              'Femoral é pulso central da coxa — técnica de PA braquial usa braquial, não femoral.',
          },
          {
            label: 'Letra C — carótida',
            detail: 'Pulso cervical.',
            correct:
              'Carótida é pulso central no pescoço — não é o vaso comprimido pelo esfigmomanômetro no membro superior.',
          },
          {
            label: 'Letra E — basílica',
            detail: 'Artéria profunda do braço.',
            correct:
              'Basílica corre profundamente no braço — palpação padrão para PA auscultatória é na artéria braquial superficial.',
          },
        ],
        footer_rule: 'Só braquial fecha PA no braço',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344097180-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'COFEN/MS — sala de acolhimento PA: cadeira confortável · mesa · esfigmomanômetro calibrado · estetoscópio',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Materiais — sala de PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Reunião de equipe — disposição de materiais na sala de acolhimento para verificar PA.',
            icon: 'Target',
          },
          {
            label: 'Esfigmomanômetro',
            detail:
              'Equipamento essencial para medir PA — letra D.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — maca',
            detail:
              'Letra A: maca + estetoscópio aneroide — PA ambulatorial usa cadeira, não maca.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — manguito inadequado',
            detail:
              'Letra B: só braçadeira sem esfigmomanômetro completo — manguito deve cobrir ~80% do braço.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — luva estéril',
            detail:
              'Letra B: luva estéril — PA de rotina não exige campo estéril.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — precórdio',
            detail:
              'Letra E: precórdio + estetoscópio sem diafragma — não é material de PA.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'PA ambulatorial → esfigmomanômetro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: material correto para sala de acolhimento com verificação de PA.',
          'Contexto: usuário sentado aguardando aferição — ambiente ambulatorial.',
          'Testar A — maca + aneroide: maca é leito, não acolhimento sentado → eliminar.',
          'Testar B — braçadeira + luva estéril: luva estéril desnecessária → eliminar.',
          'Testar C — esfigma de aneroide: termo incompleto/inadequado → eliminar.',
          'Testar D — esfigmomanômetro: equipamento padrão de PA → candidata.',
          'Testar E — precórdio sem diafragma: material incorreto → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'Esfigmomanômetro → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — materiais PA',
        meta: slideMeta,
        content: 'SALA DE ACOLHIMENTO PA',
        rows: [
          { label: 'Essencial', value: 'Esfigmomanômetro calibrado + estetoscópio', sv_kind: 'pa', badge: 'hot' },
          { label: 'Mobiliário', value: 'Cadeira confortável · mesa · apoio para braço', sv_kind: 'meta', badge: 'ok' },
          { label: 'Maca', value: 'Leito — não substitui cadeira na PA ambulatorial', sv_kind: 'meta', badge: 'warn' },
          { label: 'Luva estéril', value: 'Procedimento asséptico — não rotina de SV', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Manguito + manômetro = esfigmomanômetro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MATERIAIS VUNESP',
        items: [
          {
            label: 'Letra A — maca e aneroide',
            detail: 'Maca com estetoscópio aneroide.',
            correct:
              'Maca é para decúbito — sala de acolhimento para PA usa cadeira e esfigmomanômetro completo, não leito.',
          },
          {
            label: 'Letra B — braçadeira e luva estéril',
            detail: 'Braçadeira com luva estéril.',
            correct:
              'Aferição de PA de rotina usa luva de procedimento se necessário — luva estéril é de campo asséptico, não de SV.',
          },
          {
            label: 'Letra C — esfigma de aneroide',
            detail: 'Termo abreviado e incompleto.',
            correct:
              '“Esfigma de aneroide” não nomeia corretamente o equipamento — o termo técnico é esfigmomanômetro (manguito + manômetro).',
          },
          {
            label: 'Letra E — precórdio sem diafragma',
            detail: 'Precórdio com estetoscópio sem diafragma.',
            correct:
              'Precórdio é região cardíaca — material de PA inclui esfigmomanômetro com estetoscópio diafragmado para Korotkoff.',
          },
        ],
        footer_rule: 'Equipamento PA → esfigmomanômetro',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344097180-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS — dor precordial + taquicardia + taquipneia + hipertensão: FC > 100 · FR > 20 · PAS elevada com PAD elevada',
    roi_error: 'sv_faixas_invertidas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Emergência — SV alterados',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Senhor 55 anos, dor precordial intensa, taquicardia, taquipneia e hipertensão — valores compatíveis.',
            icon: 'Target',
          },
          {
            label: 'Perfil esperado',
            detail:
              'FC > 100 bpm + FR > 20 irpm + PAS ≥ 140 mmHg — letra A traduz taquicardia, taquipneia e hipertensão.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — valores normais',
            detail:
              'Letra B: 90 bpm, 20 irpm, 135×80 — perfil de repouso, não de emergência.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — FR normal',
            detail:
              'Letras C, D e E: FR 15–18 irpm — abaixo do limiar de taquipneia (> 20).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Taqui + taquipneia + hipertensão → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valores que traduzem taquicardia + taquipneia + hipertensão arterial.',
          'Decodificar: FC > 100 · FR > 20 · PA sistólica e diastólica elevadas.',
          'Testar A — taquicardia + taquipneia + hipertensão grave → candidata.',
          'Testar B — normocárdico + eupneico + normotenso → eliminar.',
          'Testar C — FR eupneica apesar de PA elevada → eliminar.',
          'Testar D — bradipneia com taquicardia → eliminar.',
          'Testar E — taquicardia e hipertensão mas FR eupneica → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Triplo alterado → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'CLASSIFIQUE CADA PARÂMETRO',
        rows: [
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Hipertensão', value: 'PAS ≥ 140 e/ou PAD ≥ 90 mmHg', sv_kind: 'pa', badge: 'hot' },
          { label: 'Caso A', value: 'Taquicardia · taquipneia · hipertensão — todos alterados', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Julgue FC, FR e PA separadamente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EMERGÊNCIA VUNESP',
        items: [
          {
            label: 'Letra B — perfil de repouso',
            detail: 'FC, FR e PA dentro das faixas normais.',
            correct:
              'Paciente com dor precordial intensa e quadro de emergência não apresenta SV normais — perfil é de instabilidade hemodinâmica.',
          },
          {
            label: 'Letra C — FR eupneica',
            detail: 'FC elevada mas FR na faixa normal.',
            correct:
              'FR na faixa eupneica (12–20 irpm) não traduz taquipneia exigida pelo enunciado.',
          },
          {
            label: 'Letra D — bradipneia',
            detail: 'FC taquicárdica mas FR abaixo de 12 irpm.',
            correct:
              'Bradipneia não combina com o quadro de taquipneia pedido — enunciato exige FR > 20 irpm.',
          },
          {
            label: 'Letra E — taquicardia sem taquipneia',
            detail: 'Taquicardia e hipertensão mas FR eupneica.',
            correct:
              'FR eupneica não configura taquipneia — gabarito exige FR > 20 irpm junto com FC e PA elevadas.',
          },
        ],
        footer_rule: 'Só A fecha os três alterados',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344097180-8': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — pseudohipertensão no idoso com aterosclerose: manobra de Osler (compressão radial com manguito insuflado) confirma artéria rígida',
    exam_vs_current:
      'Prova cobra manobra de Osler — Heimlich e Valsalva são distratores de outras manobras clínicas',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pseudohipertensão — idoso aterosclerótico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Idoso com aterosclerose — dificuldade na PA: estratégia para resultado fidedigno (pseudohipertensão).',
            icon: 'Target',
          },
          {
            label: 'Manobra de Osler',
            detail:
              'Comprimir artéria radial com manguito insuflado — detecta artéria rígida — letra C.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — Heimlich',
            detail: 'Letra A: manobra de engasgo — não tem relação com PA.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — Valsalva',
            detail: 'Letra B: manobra de orelha/intra-abdominal — outro contexto.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — PA em pé',
            detail:
              'Letra E: ortostatismo — distinto de pseudohipertensão por artéria calcificada.',
            icon: 'Scale',
          },
        ],
        footer_rule: 'Artéria rígida → manobra de Osler',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: estratégia para PA fidedigna em idoso com aterosclerose (pseudohipertensão).',
          'Contexto: artérias calcificadas impedem compressão completa — leitura falsamente elevada.',
          'Testar A — Heimlich: desobstrução de vias aéreas → eliminar.',
          'Testar B — Valsalva: pressão intratorácica/orelha → eliminar.',
          'Testar C — Osler: comprimir radial com manguito insuflado → candidata.',
          'Testar D — artéria cefálica: sítio incorreto → eliminar.',
          'Testar E — PA em pé: ortostatismo → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Pseudohipertensão → Osler → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pseudohipertensão',
        meta: slideMeta,
        content: 'IDOSO · ARTÉRIA RÍGIDA',
        rows: [
          { label: 'Pseudohipertensão', value: 'PA falsamente alta por artéria não compressível', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manobra de Osler', value: 'Radial palpável com manguito acima da sistólica', sv_kind: 'pa', badge: 'hot' },
          { label: 'População', value: 'Idosos · aterosclerose · HAS de longa data', sv_kind: 'meta', badge: 'ok' },
          { label: 'Ortostatismo', value: 'PA sentado/em pé — fenômeno distinto', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Osler confirma artéria calcificada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PSEUDOHT VUNESP',
        items: [
          {
            label: 'Letra A — manobra de Heimlich',
            detail: 'Manobra abdominal de emergência.',
            correct:
              'Heimlich desobstrui vias aéreas em engasgo — não avalia rigidez arterial nem pseudohipertensão.',
          },
          {
            label: 'Letra B — manobra de Valsalva',
            detail: 'Expiração forçada contra glote fechada.',
            correct:
              'Valsalva altera pressões intratorácicas ou testa tuba auditiva — não diagnostica artéria rígida no idoso.',
          },
          {
            label: 'Letra D — artéria cefálica',
            detail: 'Aferir PA na artéria cefálica.',
            correct:
              'Cefálica não é sítio padrão de PA — pseudohipertensão investiga-se com manobra de Osler na artéria radial.',
          },
          {
            label: 'Letra E — PA em pé',
            detail: 'Medir com pessoa em pé.',
            correct:
              'PA em pé rastreia hipotensão ortostática — pseudohipertensão exige manobra de Osler por artéria calcificada.',
          },
        ],
        footer_rule: 'Só Osler fecha pseudohipertensão',
      },
    ],
  },

  'vunesp-enfermagem-verificacao-de-sinais-vitais-1779344105099-0': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — PA 100×60 normotensão · FR 26 taquipneia (> 20) · FC 110 taquicardia (> 100) — registrar terminologia correta',
    exam_vs_current:
      'PA 100×60 é limítrofe-baixa mas banca classifica como normotensão — não confundir com hipotensão',
    roi_error: 'sv_faixas_invertidas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia SV — idoso 82 anos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'L.S., 82 anos — PA 100×60, FR 26 mpm, FC 110 bpm: terminologia para prontuário.',
            icon: 'Target',
          },
          {
            label: 'PA 100×60',
            detail:
              'Normotensão segundo gabarito — sistólica ≥ 90 e diastólica ≥ 60.',
            icon: 'Activity',
          },
          {
            label: 'FR 26',
            detail: 'Acima de 20 irpm = taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'FC 110',
            detail: 'Acima de 100 bpm = taquicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — hipotensão',
            detail:
              'Letras A e E: classificam PA como hipotensão — banca enquadra como normotensão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Normotensão · taquipneia · taquicardia → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologia de PA 100×60, FR 26 e FC 110.',
          'PA: 100×60 — banca classifica normotensão (não hipotensão) → eliminar A, B, E.',
          'FR: 26 > 20 → taquipneia (não eupneia nem bradipneia).',
          'FC: 110 > 100 → taquicardia (não normocardia).',
          'Testar C — normotensão + taquipneia + taquicardia → candidata.',
          'Testar D — bradipneia e normocardia: inverte FR e FC → eliminar.',
          'Confirmar tríade terminológica.',
          'Marcar C.',
        ],
        footer_rule: '100×60 · 26 · 110 → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação SV',
        meta: slideMeta,
        content: 'DECORE — TERMOS DO PRONTUÁRIO',
        rows: [
          { label: 'Normotensão', value: 'PAS ~90–140 · PAD ~60–90 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'Taquipneia', value: 'FR > 20 irpm', sv_kind: 'fr', badge: 'hot' },
          { label: 'Taquicardia', value: 'FC > 100 bpm', sv_kind: 'fc', badge: 'hot' },
          { label: 'Caso L.S.', value: 'Normotensão · taquipneia · taquicardia', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Julgue PA, FR e FC separadamente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMINOLOGIA VUNESP',
        items: [
          {
            label: 'Letra A — hipotensão e polipneia',
            detail: 'PA hipotensa e FR polipneica.',
            correct:
              'PA 100×60 enquadra normotensão na banca — FR 26 é taquipneia, não polipneia (termo reservado a padrões específicos).',
          },
          {
            label: 'Letra B — hipotensão e eupneia',
            detail: 'PA baixa com FR normal.',
            correct:
              'FR 26 irpm é taquipneia, não eupneia — e PA 100×60 não é hipotensão segundo o gabarito.',
          },
          {
            label: 'Letra D — bradipneia e normocardia',
            detail: 'FR baixa e FC normal.',
            correct:
              'FC 110 é taquicardia e FR 26 é taquipneia — inverte ambos os parâmetros respiratório e cardíaco.',
          },
          {
            label: 'Letra E — hipotensão correta em FR/FC',
            detail: 'Acerta taquipneia e taquicardia mas erra PA.',
            correct:
              'Taquipneia e taquicardia estão corretas, mas PA 100×60 é normotensão na classificação cobrada — não hipotensão.',
          },
        ],
        footer_rule: 'Tríade correta → C',
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
    console.log(`[handcraft:sv-g24] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g24] total=${ok}`);
}

main();
