#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g31 (8 slugs P1 vitals_interpretacao batch 1).
 * Novo cluster: SV geral / múltiplos parâmetros (14 slugs — g31=8, g32=6).
 *
 *   npm run handcraft:sinais-vitais-g31
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g31';
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
    'PA normotenso · hipotenso · hipertenso',
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'temperatura axilar afebril',
    'TRC ~2 s',
    'monitor multiparamétrico — preparo de pele',
    'pulsos periféricos — braquial · poplítea',
    'avaliação pupilar — isocoria · anisocoria',
    'frequência de SV materno no parto',
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
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343904263-0': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/COFEN — monitor multiparamétrico: montar grampos antes dos eletrodos · esfregar pele a seco se necessário · gel condutivo reduz impedância · não usar álcool/éter rotineiramente',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Monitor multiparamétrico — preparo da pele',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'UTI pós-cirúrgico — preparo do paciente para acoplamento de eletrodos no monitor.',
            icon: 'Target',
          },
          {
            label: 'Grampos antes dos eletrodos',
            detail:
              'Montar conexões antes de posicionar no paciente — técnica recomendada (letra B).',
            icon: 'Activity',
          },
          {
            label: 'Esfregar pele a seco',
            detail:
              'Aumenta fluxo capilar local e melhora contato — quando necessário.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — pele sem preparo',
            detail:
              'Letra A: pele não precisa preparação — falso; impedância alta distorce traçado.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — álcool/éter sempre',
            detail:
              'Letra C: limpeza com álcool puro ou éter em todos os casos — não é rotina.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — conduta errada no preparo',
            detail:
              'Alternativas incorretas invertem gel, fricção seca ou dispensam preparo — mito de “pele dispensa acoplamento”.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Preparo ativo da pele → grampos + fricção seca',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preparo para monitor multiparamétrico na UTI.',
          'Testar A — pele sem preparação: impedância alta prejudica leitura → eliminar.',
          'Testar C — álcool/éter em todos: irrita pele e não é protocolo universal → eliminar.',
          'Testar D — proibir raspagem seca: MS permite fricção a seco → eliminar.',
          'Testar E — nunca usar gel condutivo: gel reduz impedância — afirmação invertida → eliminar.',
          'Testar B — grampos antes + esfregar a seco se necessário: conduta correta → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'B = montagem + fricção seca opcional',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — eletrodos no monitor',
        meta: slideMeta,
        content: 'PELE × IMPEDÂNCIA × CONTATO',
        rows: [
          { label: 'Sequência', value: 'Montar grampos → posicionar eletrodos', sv_kind: 'meta', badge: 'hot' },
          { label: 'Fricção seca', value: 'Opcional — melhora perfusão capilar local', sv_kind: 'meta', badge: 'ok' },
          { label: 'Gel condutivo', value: 'Reduz impedância — uso permitido', sv_kind: 'meta', badge: 'warn' },
          { label: 'Álcool/éter', value: 'Não rotina em todos os casos', sv_kind: 'meta', badge: 'warn' },
          { label: 'Objetivo', value: 'Traçado fidedigno de FC/ritmo no monitor', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Contato bom = leitura confiável no painel',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MONITOR AVANÇASP',
        items: [
          {
            label: 'Letra A — pele sem preparo',
            detail: 'Pele é bom condutor — dispensar preparação.',
            correct:
              'Sem preparo a impedância cutânea aumenta — artefatos e leitura imprecisa no monitor multiparamétrico.',
          },
          {
            label: 'Letra C — álcool ou éter sempre',
            detail: 'Limpar pele com álcool puro ou éter antes de todos os eletrodos.',
            correct:
              'Álcool/éter não são obrigatórios em todos os casos — podem irritar pele sensível; fricção seca e gel são alternativas.',
          },
          {
            label: 'Letra D — proibir raspagem seca',
            detail: 'Não esfregar a pele; usar cremes voláteis para pelos.',
            correct:
              'Raspagem/fricção a seco é técnica aceita para melhorar contato — letra D inverte a recomendação da letra B.',
          },
          {
            label: 'Letra E — nunca gel condutivo',
            detail: 'Gel interfere nas medidas ao reduzir impedância.',
            correct:
              'Gel condutivo justamente reduz impedância e melhora o sinal — proibição total é incorreta.',
          },
        ],
        footer_rule: 'Só B une grampos + fricção seca',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344158323-4': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/Potter — artéria braquial: fossa antecubital · ausculta PA e FC apical alternativa · radial=punho · basílica/cefálica=veias',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Anatomia — artéria sob o estetoscópio',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Imagem: estetoscópio sobre artéria na fossa antecubital.',
            icon: 'Target',
          },
          {
            label: 'Artéria braquial',
            detail:
              'Tronco arterial do braço — sítio de ausculta de PA e palpação na fossa antecubital.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — radial',
            detail: 'Letra A: punho — outro sítio de pulso periférico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — veias',
            detail:
              'Letras D e E: basílica e cefálica são veias superficiais — não artérias.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — ulnar',
            detail: 'Letra C: artéria ulnar — antebraço medial, não braquial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fossa antecubital → braquial (B)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: identificar artéria na imagem (estetoscópio na fossa antecubital).',
          'Local anatômico: cotovelo flexionado = fossa antecubital = braquial.',
          'Testar A — radial: punho lateral — outro sítio → eliminar.',
          'Testar C — ulnar: antebraço medial — não braquial → eliminar.',
          'Testar D — basílica: veia, não artéria → eliminar.',
          'Testar E — cefálica: veia superficial do braço → eliminar.',
          'Testar B — braquial: artéria da fossa antecubital → candidata.',
          'Marcar B.',
        ],
        footer_rule: 'Antecubital = braquial → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — artérias do membro superior',
        meta: slideMeta,
        content: 'LOCAL × VASO',
        rows: [
          { label: 'Braquial', value: 'Fossa antecubital — PA e pulso', sv_kind: 'fc', badge: 'hot' },
          { label: 'Radial', value: 'Punho lateral — pulso de rotina', sv_kind: 'fc', badge: 'ok' },
          { label: 'Ulnar', value: 'Antebraço medial', sv_kind: 'fc', badge: 'ok' },
          { label: 'Basílica/cefálica', value: 'Veias — não artérias', sv_kind: 'meta', badge: 'warn' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Não confunda veia com artéria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ANATOMIA BRAQUIO',
        items: [
          {
            label: 'Letra A — radial',
            detail: 'Estetoscópio sobre artéria radial.',
            correct:
              'Radial palpa-se no punho — imagem na fossa antecubital aponta braquial, não radial.',
          },
          {
            label: 'Letra C — ulnar',
            detail: 'Artéria ulnar no antebraço.',
            correct:
              'Ulnar situa-se no antebraço medial — estetoscópio na fossa do cotovelo identifica braquial.',
          },
          {
            label: 'Letra D — basílica',
            detail: 'Veia basílica como artéria.',
            correct:
              'Basílica é veia profunda do braço — enunciado pede artéria sob o estetoscópio.',
          },
          {
            label: 'Letra E — cefálica',
            detail: 'Veia cefálica como artéria.',
            correct:
              'Cefálica é veia superficial do braço — não corresponde ao vaso arterial da fossa antecubital.',
          },
        ],
        footer_rule: 'Fossa antecubital = braquial',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344178184-0': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/Potter — pulso poplítea: fossa poplítea (atrás do joelho) · pediosa=pé · apical=ictus · carótida=pescoço',
    roi_error: 'pulso_periferico_central',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso atrás do joelho',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'FC na região posterior do joelho — qual pulsação?',
            icon: 'Target',
          },
          {
            label: 'Artéria poplítea',
            detail:
              'Passa pela fossa poplítea — palpação posterior do joelho.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — pediosa',
            detail: 'Letra B: dorso do pé — outro pulso periférico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — apical',
            detail: 'Letra D: ausculta no tórax — não palpação no joelho.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — carótida',
            detail: 'Letra E: pescoço — pulso central, não joelho.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Atrás do joelho → poplítea (A)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: pulsação na região posterior do joelho.',
          'Anatomia: fossa poplítea = artéria poplítea.',
          'Testar B — pediosa: dorso do pé → eliminar.',
          'Testar C — auricular: não é sítio de FC → eliminar.',
          'Testar D — apical: ictus no tórax → eliminar.',
          'Testar E — carotídea: pescoço → eliminar.',
          'Testar A — poplítea: fossa posterior do joelho → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Joelho posterior = poplítea → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios de pulso',
        meta: slideMeta,
        content: 'SEGMENTO × ARTÉRIA',
        rows: [
          { label: 'Poplítea', value: 'Fossa poplítea — joelho flexionado', sv_kind: 'fc', badge: 'hot' },
          { label: 'Pediosa', value: 'Dorso do pé', sv_kind: 'fc', badge: 'ok' },
          { label: 'Apical', value: 'Ictus — ausculta no tórax', sv_kind: 'fc', badge: 'ok' },
          { label: 'Carótida', value: 'Pescoço — pulso central', sv_kind: 'fc', badge: 'warn' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Associe região anatômica ao vaso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POP LÍTEA',
        items: [
          {
            label: 'Letra B — pediosa',
            detail: 'Pulsação pediosa no pé.',
            correct:
              'Pediosa palpa-se no dorso do pé — enunciado fixa região atrás do joelho (fossa poplítea).',
          },
          {
            label: 'Letra C — auricular',
            detail: 'Pulso auricular.',
            correct:
              'Auricular não é termo de sítio de palpação de FC — distrator anatômico sem relação com joelho.',
          },
          {
            label: 'Letra D — apical',
            detail: 'Pulso apical no tórax.',
            correct:
              'Apical é auscultado no ictus cardíaco — não na região posterior do joelho.',
          },
          {
            label: 'Letra E — carotídea',
            detail: 'Pulso carotídeo no pescoço.',
            correct:
              'Carótida situa-se no pescoço — enunciado descreve palpação atrás do joelho (poplítea).',
          },
        ],
        footer_rule: 'Posterior do joelho = poplítea',
      },
    ],
  },

  'fau-unicentro-enfermagem-verificacao-de-sinais-vitais-1779344182672-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/SBP — TRC (tempo de reenchimento capilar): pressionar falange distal 5 s · retorno da coloração ~2 s = normal · >2 s sugere hipoperfusão',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TRC — perfusão periférica',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'TRC: tempo para cor da pele voltar após pressão de branqueamento na falange distal.',
            icon: 'Target',
          },
          {
            label: 'Normal ~2 segundos',
            detail:
              'Retorno rápido da coloração basal — perfusão capilar adequada.',
            icon: 'Activity',
          },
          {
            label: 'Técnica',
            detail: 'Pressionar falange distal por ~5 s até branquear — soltar e cronometrar.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — 8–10 s',
            detail: 'Letra B: tempo prolongado seria alterado, não normal.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 20–120 s',
            detail: 'Letras C–E: valores extremos indicam hipoperfusão grave.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — confundir TRC com FC',
            detail:
              'TRC mede perfusão capilar (~2 s) — não confundir com faixa de FC adulto 60–100 bpm.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'TRC normal ≈ 2 s → letra A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: TRC após pressão na falange distal — tempo normal de retorno.',
          'Definição: branquear → soltar → medir retorno da cor.',
          'Referência MS: ~2 segundos = perfusão periférica adequada.',
          'Testar B — 8–10 s: TRC prolongado → eliminar.',
          'Testar C — 20 s: muito prolongado → eliminar.',
          'Testar D — 60 s e E — 120 s: incompatíveis com normal → eliminar.',
          'Testar A — 2 segundos: faixa de normalidade → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'TRC normal = ~2 s → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — TRC',
        meta: slideMeta,
        content: 'PERFUSÃO CAPILAR',
        rows: [
          { label: 'TRC normal', value: '≈ 2 segundos (adulto)', sv_kind: 'meta', badge: 'hot' },
          { label: 'Técnica', value: 'Pressão 5 s na falange distal', sv_kind: 'meta', badge: 'ok' },
          { label: 'Prolongado', value: '> 2 s — hipoperfusão', sv_kind: 'meta', badge: 'warn' },
          { label: 'Contexto', value: 'Complementa FC/PA na avaliação hemodinâmica', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: '2 s = capilar OK · mais lento = alerta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRC FAU',
        items: [
          {
            label: 'Letra B — 8 a 10 segundos',
            detail: 'Retorno em 8–10 s como normal.',
            correct:
              'TRC de 8–10 s já indica reenchimento lento — normal é cerca de 2 segundos.',
          },
          {
            label: 'Letra C — 20 segundos',
            detail: 'Retorno em 20 segundos.',
            correct:
              '20 s é TRC muito prolongado — sinal de hipoperfusão periférica, não valor de referência.',
          },
          {
            label: 'Letra D — 60 segundos',
            detail: 'Retorno em 1 minuto.',
            correct:
              '60 s é incompatível com perfusão capilar normal — distrator de magnitude extrema.',
          },
          {
            label: 'Letra E — 120 segundos',
            detail: 'Retorno em cento e vinte segundos.',
            correct:
              '120 s não representa TRC fisiológico — valor absurdo para retorno capilar basal.',
          },
        ],
        footer_rule: 'Normal = ~2 s (A)',
      },
    ],
  },

  'fenix-instituto-enfermagem-verificacao-de-sinais-vitais-1778969768866-6': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS/COFEN — FR adulto em repouso: 12–20 irpm (incursões/min) · eupneia · <12 bradipneia · >20 taquipneia',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FR adulto — faixa de normalidade',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Faixa de normalidade da FR em adultos em repouso.',
            icon: 'Target',
          },
          {
            label: '12 a 20 irpm',
            detail: 'Referência MS para eupneia em repouso — letra B.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — 8 a 12',
            detail: 'Letra A: limite inferior abaixo do padrão adulto.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 20 a 30',
            detail: 'Letra C: inclui taquipneia como “normal”.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — 30 a 40',
            detail: 'Letra D: faixa de taquipneia acentuada.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Adulto repouso: 12–20 irpm → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: faixa normal de FR em adulto em repouso.',
          'Referência MS: 12–20 incursões por minuto.',
          'Testar A — 8 a 12: limite inferior <12 (bradipneia) → eliminar.',
          'Testar C — 20 a 30: mistura normal com taquipneia → eliminar.',
          'Testar D — 30 a 40: taquipneia → eliminar.',
          'Testar B — 12 a 20: faixa normativa MS → candidata.',
          'Marcar B.',
        ],
        footer_rule: '12–20 irpm → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR adulto',
        meta: slideMeta,
        content: 'FREQUÊNCIA RESPIRATÓRIA',
        rows: [
          { label: 'Eupneia', value: '12–20 irpm em repouso', sv_kind: 'fr', badge: 'hot' },
          { label: 'Bradipneia', value: '< 12 irpm', sv_kind: 'fr', badge: 'warn' },
          { label: 'Taquipneia', value: '> 20 irpm', sv_kind: 'fr', badge: 'warn' },
          { label: 'FC adulto', value: '60–100 bpm', sv_kind: 'fc', badge: 'ok' },
          { label: 'Contexto', value: 'Repouso · sem esforço · observação 1 min', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Decore 12–20 irpm no adulto',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FR FÊNIX',
        items: [
          {
            label: 'Letra A — 8 a 12 irpm',
            detail: 'Faixa 8–12 como normalidade.',
            correct:
              '8–12 irpm inclui bradipneia — MS define normal adulto como 12–20 irpm.',
          },
          {
            label: 'Letra C — 20 a 30 irpm',
            detail: 'Faixa 20–30 como normal.',
            correct:
              'Acima de 20 irpm configura taquipneia — não é faixa de eupneia em repouso.',
          },
          {
            label: 'Letra D — 30 a 40 irpm',
            detail: 'Faixa 30–40 como normal.',
            correct:
              '30–40 irpm é taquipneia acentuada — distante da referência 12–20 irpm.',
          },
        ],
        footer_rule: 'Normal adulto = 12–20 (B)',
      },
    ],
  },

  'fgv-enfermagem-verificacao-de-sinais-vitais-1778969760552-5': {
    family: 'protocolo',
    branch: 'vitals_interpretacao',
    guideline:
      'MS — parto de risco habitual: 1º período (dilatação) — aferir e registrar FC materna a cada 1 hora · parto de alto risco = intervalos menores',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'FC materna — 1º período do parto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Parturiente 30 anos, risco habitual — frequência de verificação da FC no 1º período.',
            icon: 'Target',
          },
          {
            label: 'A cada 1 hora',
            detail: 'MS para trabalho de parto de risco habitual na dilatação.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — 15–30 min',
            detail: 'Letras D e E: intervalos de alto risco ou período expulsivo.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — 2–4 h',
            detail: 'Letras B e C: espaçamento excessivo para SV materno.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Contexto',
            detail: 'Risco habitual ≠ alto risco — intervalo muda com classificação.',
            icon: 'User',
          },
          {
            label: 'Pegadinha — intervalo de FC',
            detail:
              'Confundir 1 h (habitual) com 15–30 min (alto risco) — mesma lógica de não aplicar faixa de FC 60–100 bpm fora do contexto.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Risco habitual · dilatação → 1/1 h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frequência de FC materna no 1º período — risco habitual.',
          'Identificar: 1º período = dilatação; parturiente de risco habitual.',
          'MS: aferir e registrar FC materna a cada 1 hora nesse contexto.',
          'Testar B — intervalo de duas horas: submonitorização → eliminar.',
          'Testar C — intervalo de quatro horas: submonitorização → eliminar.',
          'Testar D — quinze minutos e E — trinta minutos: alto risco/expulsivo → eliminar.',
          'Testar A — 1/1 h: protocolo MS risco habitual → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Dilatação + habitual → A (1 h)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SV no parto (MS)',
        meta: slideMeta,
        content: 'FREQUÊNCIA FC MATERNA',
        rows: [
          { label: '1º período habitual', value: 'FC materna a cada 1 hora', sv_kind: 'fc', badge: 'hot' },
          { label: 'Alto risco', value: 'Intervalos menores (15–30 min)', sv_kind: 'fc', badge: 'warn' },
          { label: '2º período', value: 'Monitorização mais frequente', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60–100 bpm referência', sv_kind: 'fc', badge: 'ok' },
          { label: 'Registro', value: 'Aferir + documentar no partograma', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Habitual dilatação = 1 h',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARTO FGV',
        items: [
          {
            label: 'Letra B — duas em duas horas',
            detail: 'FC materna a cada duas horas.',
            correct:
              'Intervalo de duas horas subestima vigilância no 1º período de risco habitual — MS indica uma hora.',
          },
          {
            label: 'Letra C — quatro em quatro horas',
            detail: 'FC materna a cada quatro horas.',
            correct:
              'Quatro horas é intervalo excessivo para SV materno na dilatação — não condiz com protocolo MS.',
          },
          {
            label: 'Letra D — quinze minutos',
            detail: 'FC a cada quinze minutos.',
            correct:
              'Quinze minutos é frequência de alto risco ou período expulsivo — enunciado cita risco habitual.',
          },
          {
            label: 'Letra E — trinta minutos',
            detail: 'FC a cada trinta minutos.',
            correct:
              'Trinta minutos não é o intervalo MS para parto de risco habitual no 1º período (dilatação).',
          },
        ],
        footer_rule: 'Habitual = 1 h (A)',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779344111854-8': {
    family: 'vf',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/Semiologia — midríase: dilatação patológica · miose: constrição · isocoria: pupilas iguais · anisocoria: tamanhos diferentes',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia pupilar — V/F',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'I–IV sobre avaliação pupilar — quais corretas?',
            icon: 'Target',
          },
          {
            label: 'I — midríase',
            detail: 'Dilatação pupilar por causas não fisiológicas — VERDADEIRA.',
            icon: 'Eye',
          },
          {
            label: 'III — miose',
            detail: 'Pupilas contraídas, pouco reativas à luz — VERDADEIRA.',
            icon: 'EyeOff',
          },
          {
            label: 'Pegadinha — II anisocoria',
            detail: 'II define anisocoria como simetria — inverte com isocoria.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — IV isocoria',
            detail: 'IV chama tamanhos diferentes de isocóricas — é anisocoria.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — não comunicar alteração',
            detail:
              'Alteração pupilar exige comunicar a equipe médica — não registrar e manter rotina silenciosa.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'I e III corretas → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: julgar I–IV sobre terminologia pupilar.',
          'Julgar I — midríase = dilatação patológica: VERDADEIRA.',
          'Julgar II — anisocoria = simétricas: FALSA (anisocoria = assimétricas; isocoria = iguais).',
          'Julgar III — miose = constrição pouco reativa: VERDADEIRA.',
          'Julgar IV — tamanhos diferentes = isocóricas: FALSA (isocoria = iguais).',
          'Combinação: apenas I e III corretas → letra B.',
          'Marcar B.',
        ],
        footer_rule: 'Midríase e miose corretas (I e III) → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pupilas',
        meta: slideMeta,
        content: 'TERMINOLOGIA PUPILAR',
        rows: [
          { label: 'Midríase', value: 'Dilatação — causas patológicas/farmacológicas', sv_kind: 'meta', badge: 'hot' },
          { label: 'Miose', value: 'Constrição — pouca reação à luz', sv_kind: 'meta', badge: 'hot' },
          { label: 'Isocoria', value: 'Pupilas de mesmo tamanho', sv_kind: 'meta', badge: 'ok' },
          { label: 'Anisocoria', value: 'Pupilas de tamanhos diferentes', sv_kind: 'meta', badge: 'warn' },
          { label: 'Conduta', value: 'Alteração → comunicar equipe médica', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Iso = iguais · aniso = diferentes',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F PUPILAR',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Inclui II (anisocoria = simétricas).',
            correct:
              'II inverte conceitos — anisocoria é assimetria pupilar; simetria reativa chama-se isocoria.',
          },
          {
            label: 'Letra C — II e IV',
            detail: 'Só afirmativas II e IV.',
            correct:
              'II e IV erram terminologia básica — II troca anisocoria por isocoria e IV chama desigualdade de isocoria.',
          },
          {
            label: 'Letra D — III e IV',
            detail: 'Só afirmativas III e IV.',
            correct:
              'III está correta (miose), mas IV erra — tamanhos diferentes definem anisocoria, não isocoria.',
          },
          {
            label: 'Letra E — todas',
            detail: 'I, II, III e IV corretas.',
            correct:
              'II e IV são falsas — midríase (I) e miose (III) são as únicas assertivas corretas.',
          },
        ],
        footer_rule: 'Só B fecha I + III',
      },
    ],
  },

  'furb-enfermagem-verificacao-de-sinais-vitais-1779343811344-1': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline:
      'MS/Semiologia — anisocoria: uma pupila dilatada e outra contraída · isocoria: iguais · midríase: dilatação · miose: constrição bilateral',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pupilas assimétricas',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Uma pupila dilatada e outra contraída — qual termo?',
            icon: 'Target',
          },
          {
            label: 'Anisocoria',
            detail: 'Desigualdade de tamanho/reação entre as pupilas — letra A.',
            icon: 'Eye',
          },
          {
            label: 'Pegadinha — isocoria',
            detail: 'Letra B: pupilas iguais — oposto do caso.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — midríase/miose',
            detail: 'Letras C e E: descrevem só um lado ou ambos iguais.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — nistagmo',
            detail: 'Letra D: movimento oscilatório — não tamanho pupilar.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — não comunicar anisocoria',
            detail:
              'Anisocoria é sinal neurológico — comunicar imediatamente à equipe, não só anotar no prontuário.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Dilatada × contraída → anisocoria (A)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: uma pupila dilatada, outra contraída.',
          'Definir: assimetria pupilar = anisocoria.',
          'Testar B — isocóricas: iguais — contradiz o caso → eliminar.',
          'Testar C — midriáticas: ambas dilatadas — não mistura dilata+constri → eliminar.',
          'Testar D — nistagmáticas: movimento ocular — tema diferente → eliminar.',
          'Testar E — mióticas: ambas contraídas — não o padrão descrito → eliminar.',
          'Testar A — anisocóricas: tamanhos/reações diferentes → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Assimetria = anisocoria → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação pupilar',
        meta: slideMeta,
        content: 'PUPILAS — TERMO × PADRÃO',
        rows: [
          { label: 'Anisocoria', value: 'Pupilas de tamanhos diferentes', sv_kind: 'meta', badge: 'hot' },
          { label: 'Isocoria', value: 'Pupilas iguais e simétricas', sv_kind: 'meta', badge: 'ok' },
          { label: 'Midríase', value: 'Dilatação pupilar', sv_kind: 'meta', badge: 'warn' },
          { label: 'Miose', value: 'Constrição pupilar', sv_kind: 'meta', badge: 'warn' },
          { label: 'Conduta', value: 'Comunicar alteração à equipe', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Um dilata · outra constri = anisocoria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PUPILAS FURB',
        items: [
          {
            label: 'Letra B — isocóricas',
            detail: 'Pupilas de mesmo tamanho.',
            correct:
              'Isocoria exige simetria — enunciado descreve dilatação em um olho e constrição no outro.',
          },
          {
            label: 'Letra C — midriáticas',
            detail: 'Ambas pupilas dilatadas.',
            correct:
              'Midríase bilateral não explica um olho contraído — caso pede assimetria (anisocoria).',
          },
          {
            label: 'Letra D — nistagmáticas',
            detail: 'Movimento oscilatório do globo.',
            correct:
              'Nistagmo é movimento rítmico dos olhos — não classifica diferença de tamanho pupilar.',
          },
          {
            label: 'Letra E — mióticas',
            detail: 'Ambas pupilas contraídas.',
            correct:
              'Miose bilateral ignora a pupila dilatada do par — assimetria = anisocoria.',
          },
        ],
        footer_rule: 'Dilatada + contraída = A',
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
    console.log(`[handcraft:sv-g31] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g31] total=${ok}`);
}

main();
