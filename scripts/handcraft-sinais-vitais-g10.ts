#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g10 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g10.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g10';
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
    'preparo pré-PA',
    'braço ao nível do coração',
    'SpO₂ definição',
    'classificação clínica multi-SV',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
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
  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344127707-3': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — Korotkoff I = sistólica · V = diastólica · braço ao coração · preparo: bexiga vazia · sem exercício · abstinência álcool/café/fumo',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidados na aferição PA — FEPESE Guatambu',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Cuidados corretos na aferição de PA — técnica fidedigna.',
            icon: 'Target',
          },
          {
            label: 'Preparo pré-PA',
            detail: 'Bexiga vazia · sem exercício · sem álcool, café ou cigarro próximo ao momento.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — Korotkoff invertido',
            detail: 'Sistólica = 1º som (fase I) — não o desaparecimento dos sons.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — artéria errada',
            detail: 'Manguito centraliza sobre artéria braquial — não radial.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — braço abaixo',
            detail: 'Braço ao nível do coração — abaixo superestima PA.',
            icon: 'Heart',
          },
        ],
        footer_rule: 'Preparo + Korotkoff + posição — três eixos da pegadinha FEPESE',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado correto na aferição de PA.',
          'Testar A — sistólica no desaparecimento dos sons: Korotkoff invertido → eliminar.',
          'Testar B — manguito sobre artéria radial: local errado → eliminar.',
          'Testar C — braço abaixo do coração: superestima PA → eliminar.',
          'Testar D — bexiga vazia, sem exercício, álcool, café ou fumo: preparo MS → candidata.',
          'Testar E — diastólica no 1º som: inverte fases → eliminar.',
          'Confirmar: única assertiva técnica correta é D.',
          'Marcar D.',
        ],
        footer_rule: 'Preparo pré-PA → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Korotkoff e preparo PA',
        meta: slideMeta,
        content: 'KOROTKOFF · POSIÇÃO · PREPARO',
        rows: [
          {
            label: 'Sistólica',
            value: '1º som audível (fase I de Korotkoff)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'A erra — não é o desaparecimento.',
          },
          {
            label: 'Diastólica',
            value: 'Desaparecimento dos sons (fase V) — não o 1º som',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'E erra — inverte com sistólica.',
          },
          {
            label: 'Manguito',
            value: 'Sobre artéria braquial · 2–3 cm acima da fossa cubital',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Braço',
            value: 'Nível do coração · palma para cima',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Preparo',
            value: 'Bexiga vazia · sem exercício · abstinência álcool/café/fumo',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa D.',
          },
        ],
        footer_rule: 'Decore: 1º som = sistólica · desaparecimento = diastólica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA GUATAMBU',
        items: [
          {
            label: 'Letra A — sistólica no desaparecimento',
            detail: 'Identifica pressão sistólica quando os sons cessam.',
            correct:
              'Sistólica corresponde ao 1º som (fase I) — o desaparecimento marca a diastólica.',
          },
          {
            label: 'Letra B — manguito na radial',
            detail: 'Centraliza compressão sobre artéria radial.',
            correct:
              'O manguito deve cobrir a artéria braquial — radial é local incorreto para PA.',
          },
          {
            label: 'Letra C — braço abaixo do coração',
            detail: 'Posiciona membro abaixo do nível cardíaco.',
            correct:
              'Braço abaixo do coração superestima PA — MS exige nível do átrio.',
          },
          {
            label: 'Letra E — diastólica no 1º som',
            detail: 'Mede diastólica no primeiro ruído auscultado.',
            correct:
              'Diastólica = fase V (desaparecimento) — 1º som é sistólica.',
          },
        ],
        footer_rule: 'Korotkoff invertido elimina A e E → confirme D',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344127707-4': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — Korotkoff I = sistólica · V = diastólica · estetoscópio na braquial · braço ao coração · manguito ~80% circunferência braço',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — Korotkoff e posição',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre aferição de PA — FEPESE Pinhalzinho.',
            icon: 'Target',
          },
          {
            label: 'Sem esforço + braço coração',
            detail: 'Repouso físico e membro ao nível do átrio — padrão MS.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — sons trocados',
            detail: '1º som = sistólica · último som = diastólica — banca inverte.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — estetoscópio radial',
            detail: 'Ausculta na artéria braquial — não na radial.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — manguito inadequado',
            detail: 'Bolsa do manguito ≈ 80% da circunferência do braço — distrator erra a proporção.',
            icon: 'Ruler',
          },
        ],
        footer_rule: 'Korotkoff + local de ausculta + tamanho do manguito',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre PA.',
          'Testar A — 1º som = diastólica: inverte Korotkoff → eliminar.',
          'Testar B — último som = sistólica: inverte Korotkoff → eliminar.',
          'Testar C — estetoscópio na radial: local errado → eliminar.',
          'Testar D — sem esforço + braço ao coração: MS → candidata.',
          'Testar E — proporção errada do manguito: MS usa ~80% circunferência → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'Repouso + nível do coração → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ausculta e manguito',
        meta: slideMeta,
        content: 'KOROTKOFF · AUSCULTA · MANGUITO',
        rows: [
          {
            label: '1º som',
            value: 'Pressão sistólica (fase I)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'A erra ao chamar de diastólica.',
          },
          {
            label: 'Último som',
            value: 'Pressão diastólica (fase V)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'B erra ao chamar de sistólica.',
          },
          {
            label: 'Estetoscópio',
            value: 'Sobre artéria braquial — não radial',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Braço',
            value: 'Nível do coração · sem esforço prévio',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa D.',
          },
          {
            label: 'Manguito',
            value: 'Bolsa ~80% da circunferência do braço (MS)',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'E erra a proporção do manguito.',
          },
        ],
        footer_rule: 'Não confunda 1º e último som — decore Korotkoff I e V',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KOROTKOFF PINHALZINHO',
        items: [
          {
            label: 'Letra A — 1º som diastólica',
            detail: 'Atribui diastólica ao primeiro ruído.',
            correct: 'O 1º som audível marca a pressão sistólica (fase I de Korotkoff).',
          },
          {
            label: 'Letra B — último som sistólica',
            detail: 'Atribui sistólica ao último ruído.',
            correct: 'O último som corresponde à diastólica (fase V) — não à sistólica.',
          },
          {
            label: 'Letra C — estetoscópio na radial',
            detail: 'Posiciona diafragma sobre pulso radial.',
            correct: 'A ausculta de Korotkoff é na artéria braquial, abaixo do manguito.',
          },
          {
            label: 'Letra E — manguito inadequado',
            detail: 'Exige largura incorreta do manguito em relação ao braço.',
            correct: 'Referência MS: bolsa ~80% da circunferência — proporção do distrator falsifica PA.',
          },
        ],
        footer_rule: 'Inversão de sons elimina A e B → confirme D',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344152370-3': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — FC > 100 taquicardia · FR 12–20 eupneia · PA ≥ 140/90 hipertensão',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — lacunas FEPESE Chapecó',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Completar lacunas: FC 120 · FR 18 · PA 150×90 mmHg.',
            icon: 'Target',
          },
          {
            label: 'FC 120 bpm',
            detail: 'Acima de 100 — frequência cardíaca elevada.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 18 mpm',
            detail: 'Dentro de 12–20 irpm — frequência respiratória normal.',
            icon: 'Wind',
          },
          {
            label: 'PA 150×90',
            detail: 'Ambos elevados — pressão arterial elevada.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — FC normal',
            detail: '120 bpm nunca é “normal” no adulto — é taquicardia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Traduza cada parâmetro antes de preencher as lacunas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: FC 120 · FR 18 · PA 150×90 mmHg.',
          'Lacuna (1) FC 120 → elevada (taquicardia).',
          'Lacuna (2) FR 18 → normal (eupneia).',
          'Lacuna (3) PA 150×90 → elevada (hipertensão).',
          'Testar A — FC normal + FR abaixo + PA normal: erra nos três → eliminar.',
          'Testar B — tudo normal: ignora taquicardia e hipertensão → eliminar.',
          'Testar C — elevada · normal · elevada → candidata.',
          'Testar D — tudo elevado: FR 18 não é taquipneia → eliminar.',
          'Testar E — FC abaixo: 120 é elevada → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Elevada · normal · elevada → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tradução clínica',
        meta: slideMeta,
        content: 'FC · FR · PA — LACUNAS',
        rows: [
          { label: 'FC 120', value: 'Elevada / taquicárdico (> 100 bpm)', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 18', value: 'Normal / eupneico (12–20 irpm)', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA 150×90', value: 'Elevada / hipertensa (≥ 140/90)', sv_kind: 'pa', badge: 'hot' },
          {
            label: 'Lacunas corretas',
            value: '(1) elevada · (2) normal · (3) elevada',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'FR 18 é eupneia — não confunda com taquipneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LACUNAS MULTI-SV',
        items: [
          {
            label: 'Letra A — FC normal',
            detail: 'Classifica 120 bpm como frequência cardíaca normal.',
            correct: '120 bpm > 100 — é taquicardia, não valor normal.',
          },
          {
            label: 'Letra B — tudo normal',
            detail: 'Chama PA 150×90 e FC 120 de normais.',
            correct: 'PA 150×90 é hipertensão e FC 120 é taquicardia — B erra em ambos.',
          },
          {
            label: 'Letra D — FR elevada',
            detail: 'Eleva FR 18 para taquipneia junto com FC e PA.',
            correct: 'FR 18 mpm está na faixa eupneica (12–20) — só FC e PA estão elevados.',
          },
          {
            label: 'Letra E — FC abaixo',
            detail: 'Classifica taquicardia como abaixo do normal.',
            correct: '120 bpm está acima da faixa — é elevada, não abaixo.',
          },
        ],
        footer_rule: 'Só C combina elevada · normal · elevada',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344152370-4': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline:
      'MS/COFEN — FC por palpação radial/braquial 60 s · braço ao coração na PA · FR adulto 12–20 irpm · SpO₂ ≠ batimentos',
    roi_error: 'polegar_no_pulso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Mensuração SV — técnica correta',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre mensuração dos sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Palpação FC',
            detail: 'Pulsos radial e braquial · contagem por pelo menos 1 minuto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — braço acima',
            detail: 'PA exige braço ao nível do coração — não acima.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — mercúrio obrigatório',
            detail: 'Termômetros digitais/infravermelho são aceitos — mercúrio não é único.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — SpO₂ = bpm',
            detail: 'Saturação é % de Hb ligada a O₂ — não batimentos por minuto.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Cada parâmetro tem técnica própria — não misture definições',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre mensuração de SV.',
          'Testar A — FC por palpação radial/braquial 1 min: MS → candidata.',
          'Testar B — braço acima do coração na PA: superestima → eliminar.',
          'Testar C — termômetro de mercúrio obrigatório: mito → eliminar.',
          'Testar D — SpO₂ = batimentos/min: confunde parâmetros → eliminar.',
          'Testar E — FR adulto 40–60 mpm: faixa errada → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Palpação FC 60 s → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnicas por parâmetro',
        meta: slideMeta,
        content: 'FC · PA · FR · TEMP · SpO₂',
        rows: [
          {
            label: 'FC',
            value: 'Palpar radial/braquial · contar 60 s',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Alternativa A.',
          },
          {
            label: 'PA',
            value: 'Braço ao nível do coração — não acima',
            sv_kind: 'pa',
            badge: 'warn',
          },
          { label: 'FR adulto', value: '12–20 movimentos/min (eupneia)', sv_kind: 'fr', badge: 'ok' },
          {
            label: 'SpO₂',
            value: '% de hemoglobina saturada — não bpm',
            sv_kind: 'spo2',
            badge: 'warn',
          },
          {
            label: 'Temperatura',
            value: 'Vários dispositivos válidos — mercúrio não é exclusivo',
            sv_kind: 'temp',
            badge: 'ok',
          },
        ],
        footer_rule: 'FR adulto = 12–20 — E erra com 40–60',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICAS MISTURADAS',
        items: [
          {
            label: 'Letra B — braço acima do coração',
            detail: 'Orienta posicionar braço acima do tórax na PA.',
            correct: 'Membro acima do coração gera leitura falsamente baixa — nível do átrio é o padrão.',
          },
          {
            label: 'Letra C — mercúrio obrigatório',
            detail: 'Exige termômetro de mercúrio na axila.',
            correct: 'Termômetros digitais e infravermelhos são aceitos — mercúrio não é único nem obrigatório.',
          },
          {
            label: 'Letra D — SpO₂ = bpm',
            detail: 'Define saturação como batimentos por minuto.',
            correct: 'SpO₂ mede % de oxigênio no sangue — FC é medida em bpm por palpação.',
          },
          {
            label: 'Letra E — FR 40–60',
            detail: 'Faixa fisiológica adulta de 40 a 60 mpm.',
            correct: 'FR adulto normal é 12–20 irpm — 40–60 seria taquipneia grave.',
          },
        ],
        footer_rule: 'Definições trocadas eliminam B–E → confirme A',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344196733-7': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline:
      'MS/COFEN — SpO₂ = % O₂ no sangue (máx. 100%) · FC 60–100 bpm · braço ao coração · FR 60 s inteiro',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Verificação SV — conceitos básicos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa correta sobre verificação dos sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'SpO₂ definida',
            detail: '% de oxigênio transportado pelo sangue · medida indireta · máximo 100%.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — FC 20–40',
            detail: 'Normocárdico adulto = 60–100 bpm — não 20–40.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — braço abaixo',
            detail: 'PA com braço abaixo do coração — técnica incorreta.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha — FR 10 s × 4',
            detail: 'FR deve ser contada por 1 minuto completo — não só 10 s.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'SpO₂ é % — não confunda com FC em bpm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assertiva correta sobre SV.',
          'Testar A — FC normocárdico 20–40 bpm: faixa invertida → eliminar.',
          'Testar B — braço abaixo do coração na PA: superestima → eliminar.',
          'Testar C — FR em 10 s multiplicada por 4: subcontagem → eliminar.',
          'Testar D — termômetro de mercúrio obrigatório: mito → eliminar.',
          'Testar E — SpO₂ = % O₂ no sangue, máx. 100%: definição correta → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Definição de SpO₂ → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — conceitos SV',
        meta: slideMeta,
        content: 'SpO₂ · FC · PA · FR',
        rows: [
          {
            label: 'SpO₂',
            value: '% de O₂ no sangue · medida indireta · máx. 100%',
            sv_kind: 'spo2',
            badge: 'hot',
            exam_hint: 'Alternativa E.',
          },
          { label: 'FC adulto', value: '60–100 bpm normocárdico', sv_kind: 'fc', badge: 'hot' },
          { label: 'PA', value: 'Braço ao nível do coração', sv_kind: 'pa', badge: 'ok' },
          { label: 'FR', value: 'Contar movimentos por 1 minuto inteiro', sv_kind: 'fr', badge: 'ok' },
          {
            label: 'Temperatura',
            value: 'Mercúrio não é único dispositivo aceito',
            sv_kind: 'temp',
            badge: 'ok',
          },
        ],
        footer_rule: 'SpO₂ complementa avaliação — não substitui palpação de pulso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONCEITOS SV GERAIS',
        items: [
          {
            label: 'Letra A — FC 20–40 normal',
            detail: 'Define normocárdico entre 20 e 40 bpm.',
            correct: 'FC adulto normal é 60–100 bpm — 20–40 seria bradicardia grave.',
          },
          {
            label: 'Letra B — braço abaixo do coração',
            detail: 'PA com membro pendente abaixo do tórax.',
            correct: 'Braço abaixo do coração superestima PA — posição correta é ao nível do átrio.',
          },
          {
            label: 'Letra C — FR 10 segundos',
            detail: 'Conta respiração só 10 s e multiplica por 4.',
            correct: 'FR deve ser avaliada por 1 minuto completo para maior fidedignidade.',
          },
          {
            label: 'Letra D — mercúrio obrigatório',
            detail: 'Exige termômetro de mercúrio por ser mais fidedigno.',
            correct: 'Dispositivos digitais e infravermelhos são válidos — mercúrio não é obrigatório.',
          },
        ],
        footer_rule: 'Única definição correta é SpO₂ → letra E',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344237445-2': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA ≥ 140/90 hipertensão · FC 60–100 normocárdico · FR 12–20 eupneia · T axilar < 37,8°C normotérmico',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — adulto jovem',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'PA 140×90 · FR 16 · T 36,5°C · pulso normocárdico — classificar.',
            icon: 'Target',
          },
          { label: 'PA 140×90', detail: '≥ 140/90 — hipertensão.', icon: 'Scale' },
          { label: 'Pulso', detail: '60–100 bpm — normocárdico no adulto.', icon: 'HeartPulse' },
          { label: 'FR 16 mpm', detail: '12–20 — eupneia.', icon: 'Wind' },
          { label: 'T 36,5°C axilar', detail: '< 37,8°C — normotérmico/afebril.', icon: 'Thermometer' },
        ],
        footer_rule: 'Quatro parâmetros — traduza todos antes de combinar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PA 140×90 mmHg → hipertenso.',
          'Pulso no limite inferior da normocardia → normocárdico.',
          'FR 16 mpm → eupneico.',
          'T 36,5°C → normotérmico.',
          'Testar B — taquipneico e hipotérmico: FR e T erradas → eliminar.',
          'Testar C — normotenso e febril: PA e T erradas → eliminar.',
          'Testar D — hipotenso e bradipneico: inverte PA e FR → eliminar.',
          'Testar E — taquipneico e bradicárdico: FR e FC erradas → eliminar.',
          'Combinação: hipertenso · eupneico · normotérmico · normocárdico.',
          'Marcar A.',
        ],
        footer_rule: 'Hipertenso · eupneico · normotérmico · normocárdico → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — caso Araranguá',
        meta: slideMeta,
        content: 'PA · FC · FR · TEMPERATURA',
        rows: [
          { label: 'PA 140×90', value: 'Hipertenso (≥ 140/90)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pulso', value: 'Normocárdico (60–100 bpm)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR 16', value: 'Eupneico (12–20)', sv_kind: 'fr', badge: 'ok' },
          { label: 'T 36,5°C', value: 'Normotérmico / afebril', sv_kind: 'temp', badge: 'ok' },
          {
            label: 'Síntese clínica',
            value: 'Hipertenso · eupneico · normotérmico · normocárdico',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: '140×90 já é hipertensão — não aceite “normotenso”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO ARARANGUÁ',
        items: [
          {
            label: 'Letra B — taquipneico e hipotérmico',
            detail: 'Inventa taquipneia e hipotermia.',
            correct: 'FR 16 é eupneia e T 36,5°C é normotérmica — B erra nos dois.',
          },
          {
            label: 'Letra C — normotenso e febril',
            detail: 'Rebaixa PA elevada e chama 36,5°C de febre.',
            correct: '140×90 é hipertensão e 36,5°C é afebril — C inverte ambos.',
          },
          {
            label: 'Letra D — hipotenso e bradipneico',
            detail: 'Classifica PA alta como baixa e FR normal como bradipneia.',
            correct: 'PA 140×90 = hipertenso e FR 16 = eupneia — D erra em PA e FR.',
          },
          {
            label: 'Letra E — taquipneico e bradicárdico',
            detail: 'Eleva FR normal e rebaixa FC normal.',
            correct: 'FR 16 é eupneia e pulso 75 é normocárdico — E erra nos dois.',
          },
        ],
        footer_rule: 'PA 140×90 elimina C e D → confirme A',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344237445-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — preparo sem café/álcool/fumo · manguito pela circunferência do braço · braquial não radial · braço ao coração',
    roi_error: 'braco_nivel_figado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — preparo e posição',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta na aferição de PA — FEPESE Caxambu do Sul.',
            icon: 'Target',
          },
          {
            label: 'Preparo pré-PA',
            detail:
              'Certificar bexiga vazia · sem bebidas alcoólicas, café ou alimentos · não fumou nos trinta minutos anteriores.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — exercício não interfere',
            detail: 'Atividade física recente eleva PA — preparo é obrigatório.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — manguito radial',
            detail:
              'Manguito sobre artéria braquial — não radial; estimar PAS pela palpação do pulso braquial.',
            icon: 'Ruler',
          },
          {
            label: 'Pegadinha — braço abaixo',
            detail: 'Membro ao nível do coração · palma para cima — não abaixo nem para baixo.',
            icon: 'Heart',
          },
        ],
        footer_rule: 'Preparo · manguito · posição — tríade FEPESE PA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta na PA.',
          'Testar A — exercício recente não interfere: falso → eliminar.',
          'Testar B — manguito pelo diâmetro do punho: medida errada → eliminar.',
          'Testar C — bexiga vazia, abstinência café/álcool/fumo: preparo MS → candidata.',
          'Testar D — manguito sobre artéria radial: local errado → eliminar.',
          'Testar E — braço abaixo do coração, palma para baixo: posição errada → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Preparo pré-PA → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo e técnica PA',
        meta: slideMeta,
        content: 'PREPARO · MANGUITO · POSIÇÃO',
        rows: [
          {
            label: 'Preparo',
            value: 'Bexiga vazia · abstinência café/álcool/fumo antes da aferição (SBC/MS)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Alternativa C.',
          },
          {
            label: 'Exercício',
            value: 'Altera PA — não aferir após esforço',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Manguito',
            value: 'Tamanho pela circunferência do braço · sobre artéria braquial',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Braço',
            value: 'Nível do coração · palma para cima',
            sv_kind: 'pa',
            badge: 'hot',
          },
        ],
        footer_rule: 'Punho não define manguito — use circunferência braquial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA CAXAMBU DO SUL',
        items: [
          {
            label: 'Letra A — exercício não interfere',
            detail: 'Nega efeito de exercício físico na PA.',
            correct: 'Esforço físico recente eleva PA — aguardar repouso antes de aferir.',
          },
          {
            label: 'Letra B — manguito pelo punho',
            detail: 'Mede diâmetro do punho para escolher manguito.',
            correct: 'O tamanho do manguito deriva da circunferência do braço — não do punho.',
          },
          {
            label: 'Letra D — manguito na radial',
            detail: 'Centraliza compressão sobre artéria radial.',
            correct: 'PA ausculta e comprime a artéria braquial — radial é local incorreto.',
          },
          {
            label: 'Letra E — braço abaixo, palma baixo',
            detail: 'Membro abaixo do coração com palma voltada para baixo.',
            correct: 'Braço ao nível do coração, palma para cima — abaixo superestima PA.',
          },
        ],
        footer_rule: 'Preparo + técnica eliminam A,B,D,E → confirme C',
      },
    ],
  },

  'fepese-enfermagem-verificacao-de-sinais-vitais-1779344237445-7': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — PA ≥ 140/90 hipertensão · FC ≥ 100 taquicardia · FR > 20 taquipneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Painel SV — registro da técnica Maria',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Técnica Maria registrou PA 150×110, FC 100 batimentos/min e FR 30 movimentos/min no prontuário.',
            icon: 'Target',
          },
          { label: 'PA 150×110', detail: 'Hipertensão estágio 2.', icon: 'Scale' },
          { label: 'FC 100 bpm', detail: 'No limite superior — taquicardia na prova.', icon: 'HeartPulse' },
          { label: 'FR 30 mpm', detail: 'Acima de 20 — taquipneia.', icon: 'Wind' },
          {
            label: 'Pegadinha — normocárdico',
            detail: '100 bpm na prova = taquicárdico — não “normocárdico”.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Três parâmetros alterados — hipertenso + taqui + taquipneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PA 150×110 mmHg → hipertenso.',
          'FC 100 bpm → taquicárdico (prova cobra > limite 100).',
          'FR 30 mpm → taquipneico (> 20).',
          'Testar A — normocárdico e eupneico: FC e FR erradas → eliminar.',
          'Testar C — normocárdico: FC 100 = taquicardia → eliminar.',
          'Testar D — normotenso: PA elevada → eliminar.',
          'Testar E — normotenso e eupneico: PA e FR erradas → eliminar.',
          'Combinação: hipertenso · taquicárdico · taquipneico.',
          'Marcar B.',
        ],
        footer_rule: 'Hipertenso · taquicárdico · taquipneico → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — tríade alterada',
        meta: slideMeta,
        content: 'PA · FC · FR',
        rows: [
          { label: 'PA 150×110', value: 'Hipertenso', sv_kind: 'pa', badge: 'hot' },
          { label: 'FC 100', value: 'Taquicárdico (limite prova)', sv_kind: 'fc', badge: 'hot' },
          { label: 'FR 30', value: 'Taquipneico (> 20 irpm)', sv_kind: 'fr', badge: 'hot' },
          {
            label: 'Síntese clínica',
            value: 'Hipertenso · taquicárdico · taquipneico',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'FR 30 ≠ eupneia — limite adulto 20 irpm',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO MARIA',
        items: [
          {
            label: 'Letra A — normocárdico e eupneico',
            detail: 'Ignora taquicardia e taquipneia.',
            correct: 'FC 100 = taquicárdico e FR 30 = taquipneia — A erra nos dois parâmetros.',
          },
          {
            label: 'Letra C — normocárdico',
            detail: 'Aceita FC 100 como normal mantendo taquipneia.',
            correct: '100 bpm na prova é taquicardia — C erra na classificação da FC.',
          },
          {
            label: 'Letra D — normotenso',
            detail: 'Rebaixa PA 150×110 para normotensão.',
            correct: '150×110 mmHg é hipertensão — D erra na PA.',
          },
          {
            label: 'Letra E — normotenso e eupneico',
            detail: 'Normaliza PA e FR simultaneamente.',
            correct: 'PA está elevada e FR 30 é taquipneia — E erra em ambos.',
          },
        ],
        footer_rule: 'C erra só FC — confirme B com os três parâmetros',
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
    console.log(`[handcraft:sv-g10] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g10] total=${ok}`);
}

main();
