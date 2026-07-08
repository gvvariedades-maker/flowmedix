#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g09 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g09.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g09';
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
    'notação sistólica/diastólica',
    'braço ao nível do coração',
    'preparo pré-PA',
    'classificação clínica multi-SV',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'vitals_pa_tecnica' | 'vitals_interpretacao' | 'vitals_fc_faixas';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
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
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'fau-unicentro-enfermagem-verificacao-de-sinais-vitais-1779344117207-8': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — notação PA: sistólica × diastólica mmHg; 160×100 = hipertensão estágio 2',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Leitura PA 160×100 mmHg',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'PA 160×100 na préconsulta — identificar afirmativa correta sobre a medida.',
            icon: 'Target',
          },
          {
            label: 'Notação PA',
            detail: 'Primeiro valor = pressão sistólica · segundo = diastólica (mmHg).',
            icon: 'Scale',
          },
          {
            label: 'Sistólica 160',
            detail: 'Valor superior da aferição — corresponde à contração ventricular.',
            icon: 'TrendingUp',
          },
          {
            label: 'Pegadinha — PA normal',
            detail: '160×100 ultrapassa limite normotenso (< 120×80) — não é normal.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — mediastinólica',
            detail: 'Termo inexistente — banca inventa nomenclatura para confundir com diastólica.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'PA = sistólica × diastólica — leia cada componente separadamente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: L.G.S., 33 anos — PA 160×100 mmHg na préconsulta.',
          'Testar A — PA normal: 160×100 é hipertensão → eliminar.',
          'Testar B — sistólica 160 mmHg: primeiro valor da notação → candidata.',
          'Testar C — mediastinólica 100: termo inexistente → eliminar.',
          'Testar D — cálculo inventado da diastólica: absurdo numérico → eliminar.',
          'Testar E — B, C e D corretas: apenas B procede → eliminar.',
          'Confirmar: única afirmativa factual sobre a notação é B.',
          'Marcar B.',
        ],
        footer_rule: 'Sistólica = 1º valor → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — notação PA',
        meta: slideMeta,
        content: 'SISTÓLICA · DIASTÓLICA · CLASSIFICAÇÃO',
        rows: [
          {
            label: 'Notação',
            value: 'Sistólica × diastólica (mmHg) — ex.: 160×100',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Sistólica',
            value: 'Pressão na sístole — 1º número (160 mmHg no caso)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa B.',
          },
          {
            label: 'Diastólica',
            value: 'Pressão na diástole — 2º número (100 mmHg no caso)',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: '160×100 mmHg',
            value: 'Hipertensão estágio 2 — não é normotenso',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Termos falsos',
            value: 'Mediastinólica não existe — pegadinha de prova',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore: 1º valor = sistólica — nunca aceite termo inventado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOTAÇÃO PA',
        items: [
          {
            label: 'Letra A — PA normal',
            detail: 'Classifica 160×100 como pressão arterial normal.',
            correct:
              '160×100 mmHg é hipertensão — A erra ao chamar de normotenso.',
          },
          {
            label: 'Letra C — mediastinólica',
            detail: 'Inventa termo “mediastinólica” para o 2º valor.',
            correct:
              'O 2º valor é diastólica (100 mmHg) — “mediastinólica” não existe na nomenclatura PA.',
          },
          {
            label: 'Letra D — diastólica 1,6',
            detail: 'Propõe cálculo inventado da diastólica.',
            correct:
              'Diastólica é lida diretamente na aferição (100 mmHg) — não se deriva por fórmula absurda.',
          },
          {
            label: 'Letra E — B, C e D',
            detail: 'Combina três assertivas, sendo C e D falsas.',
            correct:
              'Só B descreve corretamente a sistólica — C e D são inválidas.',
          },
        ],
        footer_rule: 'Elimine termo inventado e PA “normal” → confirme B',
      },
    ],
  },

  'fauel-enfermagem-verificacao-de-sinais-vitais-1779343822075-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA ≥ 140/90 hipertensão · FC > 100 taquicardia · FR 12–20 eupneia · T axilar < 37,8°C afebril',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — caso UBS',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'J.R.S., 69 anos, UBS Maringá — nuca, tontura, visão borrada e coração acelerado: classificar PA, FC, FR e T.',
            icon: 'Target',
          },
          {
            label: 'PA 168×120',
            detail: 'Ambos os valores elevados — hipertensão.',
            icon: 'Scale',
          },
          {
            label: 'FC acima de 100',
            detail: 'Taquicardia — coração acelerado coerente com o relato.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 16 rpm',
            detail: 'Dentro de 12–20 irpm — eupneia.',
            icon: 'Wind',
          },
          {
            label: 'T afebril',
            detail: 'Axilar abaixo de 37,8°C — sem febre.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'Traduza cada parâmetro antes de combinar a alternativa',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PA 168×120 mmHg → hipertenso.',
          'FC acima de 100 bpm → taquicárdico.',
          'FR 16 rpm → eupneico (12–20 irpm).',
          'Temperatura axilar afebril (< 37,8°C).',
          'Testar B — bradipneico: FR 16 é eupneia → eliminar.',
          'Testar C — normocárdico e febril: FC alta e T normal → eliminar.',
          'Testar D — normotenso e taquipneico: PA e FR erradas → eliminar.',
          'Combinação: hipertenso, taquicárdico, eupneico e afebril.',
          'Marcar A.',
        ],
        footer_rule: 'Hipertenso + taquicárdico + eupneico + afebril → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'PA · FC · FR · TEMPERATURA',
        rows: [
          { label: 'PA', value: 'Normotenso < 120×80 · hipertensão ≥ 140/90', sv_kind: 'pa', badge: 'hot' },
          { label: 'FC', value: '60–100 bpm normocárdico · > 100 taquicardia', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR', value: '12–20 irpm eupneia · > 20 taquipneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'Temperatura', value: 'Axilar < 37,8°C afebril', sv_kind: 'temp', badge: 'ok' },
          {
            label: 'Caso J.R.S.',
            value: 'Hipertenso · taquicárdico · eupneico · afebril',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'FR 16 não é bradipneia nem taquipneia — é eupneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLASSIFICAÇÃO MULTI-SV',
        items: [
          {
            label: 'Letra B — bradipneico',
            detail: 'Chama FR 16 de bradipneia.',
            correct: 'FR 16 irpm está na faixa eupneica (12–20) — não é bradipneia.',
          },
          {
            label: 'Letra C — normocárdico e febril',
            detail: 'Ignora taquicardia e inventa febre.',
            correct: 'FC elevada = taquicárdico e temperatura afebril — C erra nos dois.',
          },
          {
            label: 'Letra D — normotenso e taquipneico',
            detail: 'Rebaixa PA elevada e eleva FR normal.',
            correct: '168×120 é hipertensão e FR 16 é eupneia — D inverte ambos.',
          },
        ],
        footer_rule: 'Não confunda eupneia (16) com taquipneia → confirme A',
      },
    ],
  },

  'fauel-enfermagem-verificacao-de-sinais-vitais-1779343945057-0': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — FC > 100 taquicardia · PA 130/80 normotenso · FR 12–20 eupneia · temperatura axilar afebril',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — pronto atendimento',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Terminologias corretas para FC acima de 100 · FR 16 · PA 130/80 · temperatura normotérmica — J.C., 66 anos.',
            icon: 'Target',
          },
          {
            label: 'FC acima de 100',
            detail: 'Taquicardia — não normocárdico.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 16 rpm',
            detail: 'Faixa 12–20 — eupneia.',
            icon: 'Wind',
          },
          {
            label: 'PA 130/80',
            detail: 'Abaixo de 140/90 — normotenso (não hipertenso).',
            icon: 'Scale',
          },
          {
            label: 'T normotérmica',
            detail: 'Afebril — dentro da faixa axilar de referência.',
            icon: 'Thermometer',
          },
        ],
        footer_rule: 'FC > 100 = taquicardia — pegadinha clássica de prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'FC acima de 100 bpm → taquicárdico (elimina A e B com normocárdico).',
          'FR 16 rpm → eupneico (elimina B e C com taquipneico).',
          'PA 130/80 → normotenso (elimina C e D com hipertenso).',
          'Temperatura → normotérmico.',
          'Testar A — normocárdico: taquicardia no caso → eliminar.',
          'Testar B — normocárdico e taquipneico: erra FC e FR → eliminar.',
          'Testar C — hipertenso e taquipneico: erra PA e FR → eliminar.',
          'Testar D — hipertenso: PA normal → eliminar.',
          'Testar E — taquicárdico, eupneico, normotenso, normotérmico → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Taquicárdico + eupneico + normotenso + normotérmico → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tradução clínica',
        meta: slideMeta,
        content: 'FC · FR · PA · TEMPERATURA',
        rows: [
          { label: 'FC caso', value: 'Taquicárdico (> 100 bpm)', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 16', value: 'Eupneico (12–20 irpm)', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA 130/80', value: 'Normotenso', sv_kind: 'pa', badge: 'ok' },
          { label: 'Temperatura', value: 'Normotérmico / afebril', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'FC > 100 nunca é normocárdico — decore o limite',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TAQUICARDIA NO CASO',
        items: [
          {
            label: 'Letra A — normocárdico',
            detail: 'Aceita taquicardia como normal.',
            correct: 'FC acima de 100 bpm é taquicardia, não normocárdico.',
          },
          {
            label: 'Letra B — normocárdico e taquipneico',
            detail: 'Erra FC e FR simultaneamente.',
            correct: 'Taquicardia no caso e FR 16 = eupneia — B erra em ambos.',
          },
          {
            label: 'Letra C — hipertenso e taquipneico',
            detail: 'Inventa hipertensão e taquipneia.',
            correct: 'PA 130/80 é normotenso e FR 16 é eupneia.',
          },
          {
            label: 'Letra D — hipertenso',
            detail: 'Classifica PA normal como hipertensão.',
            correct: '130/80 mmHg está na faixa normotensa — não é hipertensão.',
          },
        ],
        footer_rule: 'Limite FC 100 elimina A e B → confirme E',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343856589-3': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — técnica PA: braço coração · repouso 3–5 min · abstinência café/cigarro · estresse altera PA · manguito 2–3 cm acima fossa cubital',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica de PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Julgar assertivas I–V sobre aferição de PA — FEPESE Concórdia.',
            icon: 'Target',
          },
          {
            label: 'Item I — posição',
            detail: 'Braço ao coração · palma para cima · roupa sem garrotear → VERDADEIRO.',
            icon: 'User',
          },
          {
            label: 'Item II — abstinência',
            detail: 'Evitar refeição grande, cigarro e cafeína antes da medida → VERDADEIRO.',
            icon: 'Ban',
          },
          {
            label: 'Item III — repouso',
            detail: 'Explicar procedimento · repouso de 3 a 5 min ambiente calmo → VERDADEIRO.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — item IV',
            detail: 'Estresse físico (dor) e emocional ALTERAM PA — assertiva é FALSA.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Item V — manguito',
            detail: 'Manguito sem folgas · 2 a 3 cm acima da fossa cubital → VERDADEIRO.',
            icon: 'Ruler',
          },
        ],
        footer_rule: 'Item IV = F — dor e estresse elevam PA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: cinco assertivas I–V sobre técnica PA.',
          'Julgar I — braço coração, palma cima, sem garrotear → VERDADEIRO.',
          'Julgar II — abstinência café/cigarro/refeição antes da medida → VERDADEIRO.',
          'Julgar III — explicar + repouso 3–5 min → VERDADEIRO.',
          'Julgar IV — estresse não altera PA → FALSO (dor e ansiedade alteram).',
          'Julgar V — manguito 2–3 cm acima fossa cubital → VERDADEIRO.',
          'Sequência: V · V · V · F · V.',
          'Eliminar A (IV=V), C, D e E.',
          'Marcar B.',
        ],
        footer_rule: 'V V V F V → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA MS',
        meta: slideMeta,
        content: 'POSIÇÃO · REPOUSO · INTERFERENTES · MANGUITO',
        rows: [
          { label: 'Braço', value: 'Nível do coração · palma supinada · sem garrotear roupa', sv_kind: 'pa', badge: 'hot', exam_hint: 'I = V.' },
          { label: 'Abstinência', value: 'Evitar café, cigarro e refeição pesada antes da medida', sv_kind: 'pa', badge: 'hot', exam_hint: 'II = V.' },
          { label: 'Repouso', value: '3–5 min sentado · explicar procedimento', sv_kind: 'pa', badge: 'hot', exam_hint: 'III = V.' },
          { label: 'Estresse/dor', value: 'Elevam PA — IV é FALSO ao negar', sv_kind: 'pa', badge: 'hot', exam_hint: 'IV = F.' },
          { label: 'Manguito', value: '2–3 cm acima da fossa cubital · sem folgas', sv_kind: 'pa', badge: 'ok', exam_hint: 'V = V.' },
        ],
        footer_rule: 'Estresse altera PA — único F da sequência',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F PA FEPESE',
        items: [
          {
            label: 'Letra A — V V V V V',
            detail: 'Aceita que estresse não altera PA.',
            correct: 'Item IV é falso — dor e estresse emocional elevam a pressão arterial.',
          },
          {
            label: 'Letra C — V F V F V',
            detail: 'Marca abstinência e estresse como falsos.',
            correct: 'Item II (abstinência) é verdadeiro — C erra ao colocar F.',
          },
          {
            label: 'Letra D — F V F F F',
            detail: 'Inverte posição do braço e repouso.',
            correct: 'Itens I e III são verdadeiros — D erra ao marcar F no preparo.',
          },
          {
            label: 'Letra E — F F F V F',
            detail: 'Único V no estresse (item 4).',
            correct: 'Item IV deve ser F — E marca V no único item falso.',
          },
        ],
        footer_rule: 'Item 4 falso elimina A — confirme B (V V V F V)',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343856589-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — braço ao nível do coração · exercício e bexiga cheia interferem · manguito no braço não antebraço',
    roi_error: 'braco_nivel_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados na aferição PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Cuidados corretos para aferição fidedigna de PA — FEPESE SAMU.',
            icon: 'Target',
          },
          {
            label: 'Braço ao coração',
            detail: 'Membro apoiado na altura do átrio — leitura de referência.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — braço deslocado',
            detail:
              'B e C colocam braço acima ou abaixo do coração — MS exige nível do átrio, não do fígado nem do ombro.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — exercício/bexiga',
            detail: 'Alternativa A nega interferência — MS exige preparo.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — manguito',
            detail: 'Manguito no braço (~80% circunferência) — não cobre antebraço inteiro.',
            icon: 'Ruler',
          },
        ],
        footer_rule: 'Nível do coração — não acima, não abaixo, não “indiferente”',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidados corretos na PA.',
          'Testar A — exercício/bexiga não interferem: falso → eliminar.',
          'Testar B — braço acima do coração: superestima → eliminar.',
          'Testar C — braço abaixo do coração: subestima → eliminar.',
          'Testar D — manguito no antebraço inteiro: local errado → eliminar.',
          'Testar E — braço na altura do coração: MS → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Braço ao nível do coração → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posicionamento PA',
        meta: slideMeta,
        content: 'BRAÇO · MANGUITO · PREPARO',
        rows: [
          {
            label: 'Altura do braço',
            value: 'Nível do coração — apoiado, palma para cima',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa E.',
          },
          {
            label: 'Acima do coração',
            value: 'PA falsamente baixa — eliminar B',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Abaixo do coração',
            value: 'PA falsamente alta — eliminar C',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Manguito',
            value: 'Braço superior · 2–3 cm acima da fossa cubital',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Interferentes',
            value: 'Exercício recente e bexiga cheia alteram PA',
            sv_kind: 'pa',
            badge: 'hot',
          },
        ],
        footer_rule: 'Tríade pegadinha: acima · abaixo · “não interfere”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POSIÇÃO PA',
        items: [
          {
            label: 'Letra A — sem interferência',
            detail: 'Nega efeito de exercício e bexiga cheia.',
            correct:
              'Atividade física e bexiga distendida elevam PA — preparo é obrigatório.',
          },
          {
            label: 'Letra B — acima do coração',
            detail: 'Braço elevado acima do tórax.',
            correct:
              'Membro acima do coração subestima PA — posição correta é ao nível do átrio.',
          },
          {
            label: 'Letra C — abaixo do coração',
            detail: 'Braço pendente abaixo do tórax.',
            correct:
              'Braço abaixo do coração superestima PA — MS exige nível do coração.',
          },
          {
            label: 'Letra D — manguito no antebraço',
            detail: 'Manguito cobrindo antebraço inteiro.',
            correct:
              'Manguito ajusta-se ao braço — antebraço inteiro é técnica incorreta.',
          },
        ],
        footer_rule: 'Elimine deslocamento do braço → confirme E',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343856589-7': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA 110×75 normotenso · FC > 100 taquicardia · FR > 20 taquipneia · T < 37,8°C afebril',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — caso clínico',
        meta: slideMeta,
        items: [
          { label: 'PA 110×75', detail: 'Normotensão no adulto.', icon: 'Scale' },
          { label: '36,5°C axilar', detail: 'Afebril / normotermia.', icon: 'Thermometer' },
          { label: 'FC 110 bpm', detail: 'Taquicardia (> 100).', icon: 'HeartPulse' },
          { label: 'FR 30 mpm', detail: 'Taquipneia (> 20 irpm).', icon: 'Wind' },
          {
            label: 'Pegadinha — eupneia',
            detail: 'FR 30 mpm é taquipneia — banca troca por eupneia nas alternativas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Quatro parâmetros — traduza todos antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PA 110×75 → normotenso.',
          'T 36,5°C → afebril.',
          'FC 110 bpm → taquicárdico.',
          'FR 30 mpm → taquipneico.',
          'Testar B — febril e eupneico: T e FR erradas → eliminar.',
          'Testar C — hipotenso e normocárdico → eliminar.',
          'Testar D — hipertenso → eliminar.',
          'Testar E — normocárdico → eliminar (FC 110).',
          'Eliminar B, C, D e E — combinação: normotenso, afebril, taquicárdico e taquipneico.',
          'Marcar A.',
        ],
        footer_rule: 'Normotenso · afebril · taquicárdico · taquipneico → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação combinada',
        meta: slideMeta,
        content: 'PA NORMAL, FEBRE AUSENTE, FC E FR ELEVADAS',
        rows: [
          { label: 'PA 110×75', value: 'Normotenso', sv_kind: 'pa', badge: 'ok' },
          { label: 'Temperatura axilar 36,5°C', value: 'Afebril', sv_kind: 'temp', badge: 'ok' },
          { label: 'FC 110 bpm', value: 'Taquicárdico', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 30 mpm', value: 'Taquipneico', sv_kind: 'fr', badge: 'hot' },
        ],
        footer_rule: 'FR 30 ≠ eupneia — limite adulto 20 irpm',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO FEPESE',
        items: [
          {
            label: 'Letra D — chamar 110×75 de hipertenso',
            detail: 'PA 110×75 mmHg está na faixa normal; a letra D inventa hipertensão.',
            correct: 'PA 110×75 mmHg = normotenso, não hipertenso.',
          },
          {
            label: 'Letra C — hipotenso e normocárdico',
            detail: 'Rebaixa PA normal e ignora taquicardia.',
            correct: 'PA normal (normotenso) e FC 110 bpm = taquicárdico.',
          },
          {
            label: 'Letra B — febril e eupneico',
            detail: 'Transforma 36,5°C em febre e ignora FR elevada.',
            correct: '36,5°C = afebril e FR 30 mpm = taquipneico.',
          },
          {
            label: 'Letra E — FC 110 como normocárdico',
            detail: 'Distrator próximo — erra só na FC.',
            correct: 'FC 110 bpm = taquicárdico (acima de 100 bpm).',
          },
          {
            label: 'Chamar FR 30 de eupneia',
            detail: 'Respiração acima de 20 irpm no adulto em repouso não é eupneia.',
            correct: 'FR 30 mpm = taquipneia (acima de 20 irpm).',
          },
        ],
        footer_rule: 'E erra só FC — confirme A com os quatro parâmetros',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343919045-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — braço ao nível do coração · qualquer braço com técnica adequada · posição altera resultado',
    roi_error: 'braco_nivel_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados fidedignos na PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Cuidado correto na verificação de PA — FEPESE Caçador.',
            icon: 'Target',
          },
          {
            label: 'Nível do coração',
            detail: 'Braço apoiado na altura do átrio — padrão MS.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — braço ao fígado/ombro',
            detail:
              'B e C deslocam membro acima ou abaixo do coração — MS exige nível do átrio, não do fígado nem do ombro.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — braço direito',
            detail: 'Não há obrigatoriedade de braço direito — qualquer membro com técnica.',
            icon: 'Hand',
          },
          {
            label: 'Pegadinha — posição indiferente',
            detail: 'E nega interferência — posição do braço é crítica.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ao nível do coração — nem acima, nem abaixo, nem “tanto faz”',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado correto na PA.',
          'Testar A — braço no nível do coração: MS → candidata.',
          'Testar B — acima do coração → eliminar.',
          'Testar C — abaixo do coração → eliminar.',
          'Testar D — sempre braço direito: mito → eliminar.',
          'Testar E — posição não interfere: falso → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Nível do coração → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — braço na PA',
        meta: slideMeta,
        content: 'POSIÇÃO · MEMBRO · LEITURA',
        rows: [
          {
            label: 'Correto',
            value: 'Braço ao nível do coração — apoiado',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa A.',
          },
          {
            label: 'Acima',
            value: 'Subestima PA — distrator B',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Abaixo',
            value: 'Superestima PA — distrator C',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Braço direito',
            value: 'Não obrigatório — usar membro disponível',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Posição',
            value: 'Altera resultado — nunca dispensar',
            sv_kind: 'pa',
            badge: 'hot',
          },
        ],
        footer_rule: 'Mesma pegadinha FEPESE: acima · abaixo · indiferente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BRAÇO PA CAÇADOR',
        items: [
          {
            label: 'Letra B — acima do coração',
            detail: 'Eleva braço acima do tórax.',
            correct: 'Membro acima do coração gera leitura falsamente baixa.',
          },
          {
            label: 'Letra C — abaixo do coração',
            detail: 'Braço pendente abaixo do nível cardíaco.',
            correct: 'Abaixo do coração superestima PA — técnica incorreta.',
          },
          {
            label: 'Letra D — sempre direito',
            detail: 'Obriga braço direito em toda aferição.',
            correct: 'Qualquer braço serve com manguito adequado — não há lado obrigatório.',
          },
          {
            label: 'Letra E — posição indiferente',
            detail: 'Nega efeito do posicionamento.',
            correct: 'Altura do braço altera PA — posição é cuidado essencial.',
          },
        ],
        footer_rule: 'Tríade B/C/E eliminada → confirme A',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779343919045-6': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/COFEN — FC adulto 60–100 bpm · FR adulto 12–20 irpm · > 100 taquicardia · > 20 taquipneia',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faixas de referência — adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmativa correta sobre valores de referência — FEPESE Caçador.',
            icon: 'Target',
          },
          {
            label: 'FR 18 mpm',
            detail: 'Dentro de 12–20 irpm — padrão normal adulto.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — FC acima de 100',
            detail: 'FC acima de 100 é taquicardia — banca chama de “dentro do normal”.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — FR 25 e 45',
            detail: 'Ambas acima de 20 — taquipneia; 45 não é eupneia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — normocárdico',
            detail: 'FC dentro de 60–100 é normal — banca chama de taquicárdico.',
            icon: 'Check',
          },
        ],
        footer_rule: 'FR 18 = normal · FC > 100 = taquicardia · faixa 60–100 = normocárdico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor dentro do padrão normal.',
          'Testar A — FR 18 mpm: 12–20 irpm → candidata.',
          'Testar B — FC acima de 100 como normal: taquicardia → eliminar.',
          'Testar C — FR 25 normal: > 20 = taquipneia → eliminar.',
          'Testar D — normocárdico como taquicárdico: faixa 60–100 → eliminar.',
          'Testar E — FR 45 eupneico: taquipneia grave → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'FR 18 dentro da faixa → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto MS',
        meta: slideMeta,
        content: 'FC · FR · CLASSIFICAÇÃO',
        rows: [
          { label: 'FC normal', value: '60–100 bpm — normocárdico', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC > 100', value: 'Taquicardia — fora do normal', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC 60–100', value: 'Normocárdico — não é taquicardia', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR normal', value: '12–20 irmp — eupneia', sv_kind: 'fr', badge: 'hot', exam_hint: 'Letra A (18 mpm).' },
          { label: 'FR 25 / 45', value: 'Taquipneia — acima de 20', sv_kind: 'fr', badge: 'warn' },
        ],
        footer_rule: 'Decore: FC limite 100 · FR limite 20',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXAS FC/FR',
        items: [
          {
            label: 'Letra B — FC acima de 100 como normal',
            detail: 'Classifica taquicardia como dentro do padrão.',
            correct: 'Qualquer FC > 100 bpm é taquicardia, não valor normal.',
          },
          {
            label: 'Letra C — FR 25 normal',
            detail: 'Aceita taquipneia leve como eupneia.',
            correct: '25 irpm > 20 — taquipneia, fora da faixa 12–20.',
          },
          {
            label: 'Letra D — normocárdico como taquicárdico',
            detail: 'Inverte classificação de FC normal.',
            correct: 'FC na faixa 60–100 bpm é normocárdico, não taquicárdico.',
          },
          {
            label: 'Letra E — FR 45 eupneico',
            detail: 'Chama taquipneia grave de respiração normal.',
            correct: '45 mpm é taquipneia acentuada — jamais eupneia.',
          },
        ],
        footer_rule: 'Só FR 18 está na faixa → confirme A',
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
    console.log(`[handcraft:sv-g09] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g09] total=${ok}`);
}

main();
