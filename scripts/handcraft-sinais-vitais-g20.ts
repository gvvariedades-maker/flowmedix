#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g20 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npm run handcraft:sinais-vitais-g20
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g20';
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
    'manguito proporcional',
    'medida bilateral PA',
    'Korotkoff e deflação',
    'classificação terminológica SV',
    'controle de diurese',
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
  'itame-enfermagem-verificacao-de-sinais-vitais-1779343822075-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — 1ª aferição bilateral · 3 medidas com 1 min de intervalo · média da 2ª e 3ª · braço de referência = maior valor aferido',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA bilateral — braço de referência',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Técnica MS: 1ª verificação em ambos os braços, 3 medidas com 1 min de intervalo — qual braço vira referência nas próximas aferições.',
            icon: 'Target',
          },
          {
            label: 'Medida bilateral',
            detail: 'Primeira avaliação nos dois membros superiores — detectar assimetria.',
            icon: 'Activity',
          },
          {
            label: 'Braço de referência',
            detail: 'Registrar e seguir o braço com maior pressão aferida.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — menor valor (hipotenso relativo)',
            detail:
              'Letra A escolhe o braço hipotenso relativo — subestima a pressão e classifica errado normo/hiper.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — preferência do paciente',
            detail: 'Letra D usa comodidade — não é critério técnico.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Maior valor bilateral = braço de referência',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: braço de referência após técnica MS bilateral.',
          'Revisar protocolo: 3 medidas, intervalo 1 min, média 2ª+3ª; se 1ª abaixo do corte da prova, sem medidas extras.',
          'Testar A — braço com menor valor: subestima PA → eliminar.',
          'Testar B — valor intermediário: não é critério MS → eliminar.',
          'Testar C — braço com maior valor aferido: SBC/MS → candidata.',
          'Testar D — preferência do paciente: subjetivo → eliminar.',
          'Confirmar critério técnico.',
          'Marcar C.',
        ],
        footer_rule: 'Maior PA bilateral → braço de referência → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 1ª aferição PA',
        meta: slideMeta,
        content: 'DECORE — MEDIDA BILATERAL',
        rows: [
          { label: '1ª avaliação', value: 'Medir ambos os braços', sv_kind: 'pa', badge: 'hot' },
          { label: 'Sequência', value: '3 medidas · intervalo 1 min · média 2ª e 3ª', sv_kind: 'pa', badge: 'ok' },
          { label: 'Corte simplificado', value: 'Se 1ª abaixo de 130 mmHg sistólica → sem medidas adicionais', sv_kind: 'pa', badge: 'ok' },
          { label: 'Braço referência', value: 'Maior valor aferido — não o menor', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Assimetria pressórica: seguir o lado mais alto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BRAÇO DE REFERÊNCIA ITAME',
        items: [
          {
            label: 'Letra A — braço com menor valor',
            detail: 'Escolhe o lado hipotenso relativo.',
            correct:
              'O braço com menor PA subestima o risco cardiovascular — MS indica o membro com maior valor como referência.',
          },
          {
            label: 'Letra B — valor intermediário',
            detail: 'Inventa categoria sem base normativa.',
            correct:
              'Não existe “braço intermediário” no protocolo — a referência é o maior valor medido bilateralmente.',
          },
          {
            label: 'Letra D — preferência do paciente',
            detail: 'Prioriza comodidade sobre técnica.',
            correct:
              'Preferência subjetiva não substitui critério clínico — o braço com maior PA deve ser o de referência.',
          },
        ],
        footer_rule: 'Maior valor aferido → C',
      },
    ],
  },

  'ivin-enfermagem-verificacao-de-sinais-vitais-1779343919045-1': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — febre intermitente · bradicardia < 60 bpm · taquipneia = FR aumentada · repouso PA ≥ 3–5 min silencioso · escalas unidimensionais de dor',
    exam_vs_current:
      'Item 4 da prova cita repouso de 2 min — MS recomenda 3–5 min; slides seguem gabarito F no item IV',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — cinco assertivas SSVV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Julgar cinco itens sobre SSVV e achar a sequência V/F correta.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — febre intermitente',
            detail: 'Picos alternados com temperatura normal em 24 h — definição correta → V.',
            icon: 'Thermometer',
          },
          {
            label: 'Afirmativa II — bradicardia',
            detail: 'Afirma FC elevada > 100 — inverte conceito → F.',
            icon: 'HeartPulse',
          },
          {
            label: 'Afirmativa III — taquipneia',
            detail: 'Chama respiração lenta e superficial — taquipneia é FR aumentada → F.',
            icon: 'Wind',
          },
          {
            label: 'Afirmativa IV — repouso PA',
            detail: 'Repouso insuficiente antes da PA — MS exige 3–5 min em silêncio → F.',
            icon: 'Clock',
          },
          {
            label: 'Afirmativa V — escalas de dor',
            detail: 'Escalas unidimensionais — aplicação rápida e simples → V.',
            icon: 'ClipboardList',
          },
        ],
        footer_rule: 'V, F, F, F, V → letra A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F — julgar afirmativas I, II, III, IV e V.',
          'Julgar I — febre intermitente com retorno afebril em 24 h: correto → VERDADEIRO.',
          'Julgar II — bradicardia = FC > 100: bradicardia é < 60 → FALSO.',
          'Julgar III — taquipneia = respiração lenta: taquipneia é acelerada → FALSO.',
          'Julgar IV — repouso breve para PA: insuficiente — MS usa 3–5 min → FALSO.',
          'Julgar V — escalas unidimensionais de dor: aplicação rápida → VERDADEIRO.',
          'Sequência: V, F, F, F, V.',
          'Marcar A.',
        ],
        footer_rule: 'V, F, F, F, V → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — termos e técnica',
        meta: slideMeta,
        content: 'DECORE — NOMENCLATURA SV',
        rows: [
          { label: 'Bradicardia', value: 'FC < 60 bpm — não > 100', sv_kind: 'fc', badge: 'hot' },
          { label: 'Taquipneia', value: 'FR aumentada — não lenta/superficial', sv_kind: 'fr', badge: 'hot' },
          { label: 'Repouso PA', value: '3–5 min sentado · ambiente silencioso', sv_kind: 'pa', badge: 'ok' },
          { label: 'Febre intermitente', value: 'Picos com retorno afebril em 24 h', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Bradicardia ≠ taquicardia — não confundir polaridades',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F IVIN',
        items: [
          {
            label: 'Letra B — V, V, V, F, F',
            detail: 'Aceita bradicardia como FC elevada.',
            correct:
              'Itens II e III estão falsos — bradicardia é FC baixa e taquipneia é respiração rápida, não lenta.',
          },
          {
            label: 'Letra C — V, F, V, F, V',
            detail: 'Marca taquipneia como verdadeira.',
            correct:
              'Terceiro item (III) é falso — taquipneia indica frequência respiratória aumentada, não padrão lento e superficial.',
          },
          {
            label: 'Letra D — F, F, F, V, V',
            detail: 'Rejeita febre intermitente e aceita repouso de 2 min.',
            correct:
              'Primeiro item é verdadeiro e quarto é falso — febre intermitente está bem definida; repouso breve é insuficiente para PA.',
          },
          {
            label: 'Letra E — F, V, V, V, F',
            detail: 'Inverte bradicardia e repouso PA.',
            correct:
              'Itens II, III e IV são falsos — bradicardia não é FC alta, taquipneia não é lenta e PA exige repouso prolongado em silêncio.',
          },
        ],
        footer_rule: 'Só A combina V, F, F, F, V',
      },
    ],
  },

  'lj-assessoria-enfermagem-verificacao-de-sinais-vitais-1779344189558-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'SBC — PA ótima adulto: PAS < 120 mmHg e PAD < 80 mmHg',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA ótima — classificação SBC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Valores de PAS (mmHg) e PAD (mmHg) que classificam PA como ótima em adultos a partir de 18 anos.',
            icon: 'Target',
          },
          {
            label: 'PA ótima SBC',
            detail: 'Pressão arterial ótima: PAS < 120 mmHg e PAD < 80 mmHg — alternativa B.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — >120 e >80',
            detail: 'Letra A: ambos acima do limite — hipertensão, não ótima.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — normal-alta',
            detail: 'Letras C e D: faixas limítrofes — não são “ótima”.',
            icon: 'TrendingUp',
          },
          {
            label: 'Pegadinha — hipertensão estágio 1',
            detail: 'Letra E: 130–139 / 90–94 — hipertensão leve.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Ótima = PAS < 120 e PAD < 80',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: PA ótima em adulto — PAS e PAD.',
          'Lembrar SBC: ótima < 120×80 mmHg.',
          'Testar A — >120 e >80: ambos elevados → eliminar.',
          'Testar B — <120 e <80: critério ótimo → candidata.',
          'Testar C — 120–125 / 80–84: normal → eliminar.',
          'Testar D — 120–129 / 80–89: normal-alta → eliminar.',
          'Testar E — 130–139 / 90–94: hipertensão estágio 1 → eliminar.',
          'Marcar B.',
        ],
        footer_rule: '< 120×80 mmHg → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação PA SBC',
        meta: slideMeta,
        content: 'DECORE — CATEGORIAS ADULTO',
        rows: [
          { label: 'Ótima', value: 'PAS < 120 e PAD < 80 mmHg', sv_kind: 'pa', badge: 'hot' },
          { label: 'Normal', value: 'PAS 120–129 ou PAD 80–84', sv_kind: 'pa', badge: 'ok' },
          { label: 'Hipertensão estágio 1', value: 'PAS 130–139 ou PAD 85–89', sv_kind: 'pa', badge: 'warn' },
          { label: 'Hipertensão estágio 2', value: 'PAS ≥ 140 ou PAD ≥ 90', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Ótima é a faixa mais baixa — não confundir com normal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA ÓTIMA LJ ASSESSORIA',
        items: [
          {
            label: 'Letra A — >120 e >80',
            detail: 'Ambos os valores acima do limite ótimo.',
            correct:
              'PAS e PAD acima de 120/80 configuram pelo menos normal-alta — não PA ótima.',
          },
          {
            label: 'Letra C — 120–125 e 80–84',
            detail: 'Faixa de PA normal, não ótima.',
            correct:
              '120–125 / 80–84 é classificação “normal” na SBC — ótima exige ambos abaixo de 120 e 80.',
          },
          {
            label: 'Letra D — 120-129 e 80-89',
            detail: 'Faixa normal-alta, não ótima.',
            correct:
              '120–129 / 80–89 é classificação normal-alta — ótima exige PAS e PAD abaixo de 120 e 80 mmHg.',
          },
          {
            label: 'Letra E — 130–139 e 90–94',
            detail: 'Hipertensão leve estágio 1.',
            correct:
              '130–139 / 90–94 é hipertensão estágio 1 — distante da categoria ótima.',
          },
        ],
        footer_rule: 'Só B atende PAS < 120 e PAD < 80',
      },
    ],
  },

  'maranatha-assessoria-enfermagem-verificacao-de-sinais-vitais-1778969752567-0': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — manguito 2–4 cm acima da fossa · estetoscópio na braquial · braço na altura do coração · inflar +20–30 mmHg sobre PAS palpada',
    exam_vs_current:
      'Prova cita inflação +50 mmHg — MS usa +20–30 mmHg; slides seguem gabarito F-V-V-F',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica de PA (4 itens)',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre técnica de PA — marcar V ou F e achar a sequência correta.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — manguito na fossa',
            detail: 'Manguito exatamente na fossa cubital — posição errada → FALSO.',
            icon: 'Scale',
          },
          {
            label: 'Afirmativa II — estetoscópio braquial',
            detail: 'Campo auscultatório sobre artéria braquial — correto → VERDADEIRO.',
            icon: 'Stethoscope',
          },
          {
            label: 'Afirmativa III — braço ao coração',
            detail: 'Membro na altura do átrio — técnica correta → VERDADEIRO.',
            icon: 'Heart',
          },
          {
            label: 'Afirmativa IV — inflar +50 mmHg',
            detail: 'Inflar 50 mmHg acima da estimativa — gabarito marca F → FALSO.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'F, V, V, F → letra A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F — julgar afirmativas I, II, III e IV.',
          'Julgar I — manguito exatamente na fossa cubital: deve ficar 2–4 cm acima → FALSO.',
          'Julgar II — estetoscópio sobre artéria braquial: posição correta → VERDADEIRO.',
          'Julgar III — braço na altura do coração: alinhamento hemodinâmico → VERDADEIRO.',
          'Julgar IV — inflar 50 mmHg acima da estimativa: gabarito marca F → FALSO.',
          'Sequência: F, V, V, F.',
          'Eliminar B, C e D.',
          'Marcar A.',
        ],
        footer_rule: 'F-V-V-F na sequência I–IV → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posicionamento PA',
        meta: slideMeta,
        content: 'DECORE — TÉCNICA MS',
        rows: [
          { label: 'Manguito', value: '2–4 cm acima da fossa cubital — não na fossa', sv_kind: 'pa', badge: 'hot' },
          { label: 'Estetoscópio', value: 'Sobre artéria braquial — não no manguito', sv_kind: 'pa', badge: 'ok' },
          { label: 'Posição braço', value: 'Altura do coração · palma para cima', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA — insuflação MS', value: '+20–30 mmHg acima da PAS estimada', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Manguito na fossa = erro clássico de prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F MARANATHA',
        items: [
          {
            label: 'Letra B — F-V-F-V',
            detail: 'Marca posicionamento do manguito como verdadeiro.',
            correct:
              'Primeiro item é falso — manguito não fica na fossa cubital, e sim 2–4 cm acima dela.',
          },
          {
            label: 'Letra C — V-F-V-F',
            detail: 'Rejeita estetoscópio na braquial.',
            correct:
              'Segundo item é verdadeiro — o diafragma deve encobrir a artéria braquial, não o manguito.',
          },
          {
            label: 'Letra D — V-F-F-V',
            detail: 'Aceita manguito na fossa e rejeita braço ao coração.',
            correct:
              'Itens 1 e 3 estão invertidos — manguito na fossa é falso e braço na altura do coração é verdadeiro.',
          },
        ],
        footer_rule: 'Só A = F-V-V-F',
      },
    ],
  },

  'metrocapital-enfermagem-verificacao-de-sinais-vitais-1779344122526-7': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'SBC — normotenso: PAS < 130 mmHg e PAD < 85 mmHg (categoria normal)',
    exam_vs_current:
      '123×75 mmHg é normal-alta pela SBC ótima (< 120×80) mas normotenso no gabarito da prova',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Normotenso — escolher valor',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Qual valor de PA classifica o indivíduo como normotenso.',
            icon: 'Target',
          },
          {
            label: 'Gabarito da prova',
            detail: '123×75 mmHg — dentro da faixa normal da banca → D.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — 140/90',
            detail: 'Letra A: limiar clássico de hipertensão estágio 2.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 149/99',
            detail: 'Letra B: hipertensão acentuada.',
            icon: 'TrendingUp',
          },
          {
            label: 'Pegadinha — 145/89',
            detail: 'Letra E: sistólica hipertensiva.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Eliminar hipertensão — manter faixa intermediária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor de PA normotenso.',
          'Testar A — 140/90 mmHg: hipertensão estágio 2 → eliminar.',
          'Testar B — 149/99 mmHg: hipertensão grave → eliminar.',
          'Testar C — 141/91 mmHg: hipertensão estágio 2 → eliminar.',
          'Testar D — 123/75 mmHg: faixa normal da prova → candidata.',
          'Testar E — 145/89 mmHg: sistólica elevada → eliminar.',
          'Confirmar única faixa não hipertensiva.',
          'Marcar D.',
        ],
        footer_rule: '123×75 mmHg → D (normotenso na prova)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — normotenso × hipertensão',
        meta: slideMeta,
        content: 'COMPARE COM CATEGORIAS SBC',
        rows: [
          { label: 'Ótima', value: '< 120×80 mmHg', sv_kind: 'pa', badge: 'ok' },
          { label: 'Normal / normotenso', value: 'PAS < 130 e PAD < 85 (prova: 123×75)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Hipertensão estágio 1', value: 'PAS 130–139 ou PAD 85–89', sv_kind: 'pa', badge: 'warn' },
          { label: 'Hipertensão estágio 2', value: 'PAS ≥ 140 ou PAD ≥ 90', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: '140/90 e 149/99 são hipertensão — não normotenso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NORMOTENSO METROCAPITAL',
        items: [
          {
            label: 'Letra A — 140/90 mmHg',
            detail: 'Limite clássico de hipertensão.',
            correct:
              '140×90 mmHg é hipertensão estágio 2 pela SBC — não pode ser normotenso.',
          },
          {
            label: 'Letra B — 149/99 mmHg',
            detail: 'Pressão muito elevada.',
            correct:
              '149×99 configura hipertensão acentuada — eliminar em questão de normotensão.',
          },
          {
            label: 'Letra C — 141/91 mmHg',
            detail: 'Sistólica e diastólica em faixa hipertensiva.',
            correct:
              '141×91 mmHg é hipertensão estágio 2 — não configura normotensão como 123×75 mmHg.',
          },
          {
            label: 'Letra E — 145/89 mmHg',
            detail: 'Sistólica em faixa hipertensiva.',
            correct:
              'PAS 145 mmHg ultrapassa 140 — classifica hipertensão, não normotensão.',
          },
        ],
        footer_rule: 'Faixa intermediária 123×75 → D',
      },
    ],
  },

  'objetiva-concursos-enfermagem-verificacao-de-sinais-vitais-1778969737311-3': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — Korotkoff fase IV (abafamento) para PAD quando sons persistem até nível zero · registrar sistólica e diastólica aferidas',
    exam_vs_current:
      'Prova usa “zero | zero” para fase IV com sons até nível zero — alinhado ao gabarito A',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Korotkoff — lacunas da técnica',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Preencher lacunas: nível dos sons e momento da diastólica (fase IV — abafamento).',
            icon: 'Target',
          },
          {
            label: 'Sons até nível zero',
            detail: 'Batimentos audíveis até pressão zero no manguito — 1ª lacuna.',
            icon: 'Stethoscope',
          },
          {
            label: 'Diastólica na fase IV',
            detail: 'Abafamento dos sons Korotkoff — 2ª lacuna “zero” no gabarito.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — zero | dois',
            detail: 'Letra B: mistura fases — diastólica não é “dois”.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — três | dois',
            detail: 'Letra D: valores arbitrários sem base técnica.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Fase IV = abafamento → zero | zero',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: lacunas sobre Korotkoff e registro da PA.',
          'Contexto: sons permanecem até nível zero — fase IV para diastólica.',
          'Testar A — zero | zero: gabarito da prova → candidata.',
          'Testar B — zero | dois: segunda lacuna incorreta → eliminar.',
          'Testar C — dois | zero: primeira lacuna incorreta → eliminar.',
          'Testar D — três | dois: ambas lacunas erradas → eliminar.',
          'Confirmar par técnico da banca.',
          'Marcar A.',
        ],
        footer_rule: 'Sons até zero · diastólica fase IV → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fases Korotkoff',
        meta: slideMeta,
        content: 'DECORE — SONS E PAD',
        rows: [
          { label: 'Fase I', value: 'Primeiro som — PAS (sistólica)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Fase IV', value: 'Abafamento — PAD quando sons vão a zero', sv_kind: 'pa', badge: 'hot' },
          { label: 'Fase V', value: 'Desaparecimento total — PAD alternativa', sv_kind: 'pa', badge: 'ok' },
          { label: 'Registro', value: 'Valor sistólico e diastólico aferidos — sem arredondar', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Prova Objetiva: fase IV com sons até zero',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KOROTKOFF OBJETIVA',
        items: [
          {
            label: 'Letra B — zero | dois',
            detail: 'Segunda lacuna numérica sem sentido clínico.',
            correct:
              'Diastólica na fase IV (abafamento) não corresponde ao algarismo “dois” — gabarito usa zero para ambas lacunas.',
          },
          {
            label: 'Letra C — dois | zero',
            detail: 'Inverte o nível dos sons na primeira lacuna.',
            correct:
              'Enunciado pede sons até nível zero — primeira lacuna não pode ser “dois”.',
          },
          {
            label: 'Letra D — três | dois',
            detail: 'Combinação arbitrária de fases.',
            correct:
              'Nem “três” nem “dois” descrevem a técnica Korotkoff desta questão — ambas lacunas do gabarito são zero.',
          },
        ],
        footer_rule: 'zero | zero → A',
      },
    ],
  },

  'objetiva-concursos-enfermagem-verificacao-de-sinais-vitais-1779343801786-0': {
    family: 'vf',
    branch: 'vitals_generico',
    guideline:
      'COFEN/MS — controle diurese deambulando a cada micção · sonda vesical ≥ 6 h · coleta 24 h com registro e frasco a cada micção',
    roi_error: 'vitals_concept_generic_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diurese — afirmativas I–III C/E',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Verificação de diurese: volume urinário, função renal e aspecto da urina — julgar afirmativas e achar sequência C/E.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — deambula',
            detail: 'Paciente que deambula: controle do débito urinário a cada micção → CERTO.',
            icon: 'Droplets',
          },
          {
            label: 'Afirmativa II — sonda vesical',
            detail: 'Sonda vesical de demora: controle pelo menos a cada 6 h → CERTO.',
            icon: 'Clock',
          },
          {
            label: 'Afirmativa III — coleta 24 h',
            detail: 'Coleta de urina 24 h: volume, aspecto e frasco a cada micção → CERTO.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — intervalo da sonda',
            detail: 'Letra C marca controle da sonda como errado — técnica correta é ≥ 6 h.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'C - C - C na sequência I–III → letra B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato C/E — julgar afirmativas I, II e III sobre diurese.',
          'Julgar I — deambulando: registrar débito urinário a cada micção → CERTO.',
          'Julgar II — sonda vesical demora: controle mínimo a cada 6 h → CERTO.',
          'Julgar III — coleta 24 h: volume, aspecto e frasco a cada micção → CERTO.',
          'Sequência: C, C, C.',
          'Testar A — E-C-E: marca I e III errados → eliminar.',
          'Testar C — C-E-E: marca II e III errados → eliminar.',
          'Testar D — E-E-C: só III certo → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Três assertivas certas I–III → sequência C-C-C → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — controle de diurese',
        meta: slideMeta,
        content: 'MONITORAR DÉBITO URINÁRIO',
        rows: [
          { label: 'Deambulando', value: 'Registrar a cada micção', sv_kind: 'meta', badge: 'ok' },
          { label: 'Sonda vesical', value: 'Controle mínimo a cada 6 h', sv_kind: 'meta', badge: 'ok' },
          { label: 'Coleta 24 h', value: 'Volume + aspecto + frasco a cada micção', sv_kind: 'meta', badge: 'hot' },
          { label: 'Função', value: 'Avaliar débito urinário e função renal', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Diurese integra balanço hídrico — não confundir com PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIURESE OBJETIVA',
        items: [
          {
            label: 'Letra A — E - C - E',
            detail: 'Marca controle deambulatório e coleta 24 h como errados.',
            correct:
              'Primeiro e terceiro itens são certos — paciente deambulando registra a cada micção e coleta 24 h exige frasco a cada void.',
          },
          {
            label: 'Letra C — C - E - E',
            detail: 'Rejeita controle em sonda e coleta 24 h.',
            correct:
              'Itens 2 e 3 são certos — sonda vesical exige controle ≥ 6 h e coleta de 24 h registra cada micção.',
          },
          {
            label: 'Letra D — E - E - C',
            detail: 'Só aceita o terceiro item.',
            correct:
              'Apenas a coleta 24 h não basta — os três itens do enunciado estão corretos segundo COFEN.',
          },
        ],
        footer_rule: 'Três assertivas certas → B',
      },
    ],
  },

  'objetiva-concursos-enfermagem-verificacao-de-sinais-vitais-1779343883917-5': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — estimar PAS palpando pulso radial · inflar manguito até desaparecimento do pulso · diastólica no abafamento/desaparecimento · bexiga vazia',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA — cuidado correto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa CORRETA sobre cuidados na aferição da pressão arterial.',
            icon: 'Target',
          },
          {
            label: 'Palpação radial',
            detail: 'Estimar PAS palpando radial e inflar até sumir o pulso — alternativa B.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — diastólica no 1º som',
            detail: 'Letra A: diastólica no primeiro Korotkoff — é a sistólica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — sistólica no sumiço',
            detail: 'Letra C: sistólica no desaparecimento — confunde fase V com sistólica.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — bexiga cheia',
            detail: 'Letra D: bexiga cheia eleva PA — conduta incorreta.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Palpar radial → inflar até perder pulso',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado CORRETO na aferição da PA.',
          'Testar A — diastólica no primeiro som: primeiro som = sistólica → eliminar.',
          'Testar B — palpar radial e inflar até desaparecer pulso: técnica de estimativa PAS → candidata.',
          'Testar C — sistólica no desaparecimento do som: inverte fases → eliminar.',
          'Testar D — bexiga cheia na aferição: eleva PA artificialmente → eliminar.',
          'Confirmar única conduta técnica.',
          'Marcar B.',
        ],
        footer_rule: 'Estimativa PAS por palpação radial → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sequência técnica PA',
        meta: slideMeta,
        content: 'DECORE — PALPAÇÃO · AUSCULTA',
        rows: [
          { label: 'PA — estimativa sistólica', value: 'Pulso radial · insuflar até sumir o pulso', sv_kind: 'meta', badge: 'hot' },
          { label: 'Sistólica', value: 'Primeiro som Korotkoff (fase I)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Diastólica', value: 'Abafamento ou desaparecimento (fase IV/V)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Preparo', value: 'Bexiga vazia · repouso · silêncio', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Bexiga cheia distorce PA — esvaziar antes',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA OBJETIVA SJ OURO',
        items: [
          {
            label: 'Letra A — diastólica no primeiro som',
            detail: 'Confunde fase I com diastólica.',
            correct:
              'O primeiro som audível marca a pressão sistólica — diastólica ocorre no abafamento ou desaparecimento dos sons.',
          },
          {
            label: 'Letra C — sistólica no desaparecimento',
            detail: 'Atribui PAS ao momento errado.',
            correct:
              'Desaparecimento total dos sons (fase V) corresponde à diastólica em alguns protocolos — não à sistólica.',
          },
          {
            label: 'Letra D — bexiga cheia',
            detail: 'Preparo que eleva a leitura pressórica.',
            correct:
              'Bexiga distendida aumenta a pressão arterial — o paciente deve urinar antes da aferição, não manter bexiga cheia.',
          },
        ],
        footer_rule: 'Palpação radial pré-insuflação → B',
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
    console.log(`[handcraft:sv-g20] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g20] total=${ok}`);
}

main();
