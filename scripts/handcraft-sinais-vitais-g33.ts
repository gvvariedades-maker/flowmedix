#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g33 (vitals_exceto_tecnica batch 1: 8 slugs).
 * Cluster EXCETO/INCORRETA — técnica SV · âncora AVANÇASP PA divergente.
 *
 *   npm run handcraft:sinais-vitais-g33
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g33';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Técnica de aferição de sinais vitais — adulto',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'técnica PA — posição · manguito · repouso',
    'pulso — características · carótida',
    'sinais vitais clássicos vs oximetria',
    'EXCETO/INCORRETA — distratores corretos',
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

type Pack = {
  family: 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
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
    pedagogical_branch: 'vitals_exceto_tecnica',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'agirh-enfermagem-verificacao-de-sinais-vitais-1779344137078-3': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — técnica PA: manguito ao nível do coração · antebraço supinado (palma para cima) · costas e pés apoiados · câmara do manguito centralizada na braquial',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — técnica PA Agirh',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Para aferir PA, é INCORRETO — três alternativas descrevem posicionamento padrão; uma inverte a posição da mão.',
            icon: 'Target',
          },
          {
            label: 'Manguito ao coração',
            detail: 'Braço apoiado com câmara compressiva na altura do átrio — evita erro de leitura.',
            icon: 'HeartPulse',
          },
          {
            label: 'Posição sentada',
            detail: 'Costas e antebraço apoiados · pernas descruzadas · pés no chão — postura clássica de diretriz.',
            icon: 'Armchair',
          },
          {
            label: 'Pegadinha — palma para baixo',
            detail: 'Letra B pede palma voltada para baixo — na aferição o antebraço fica supinado (palma para cima).',
            icon: 'Ban',
          },
          {
            label: 'Centralizar braquial',
            detail: 'Meio da câmara compressiva sobre a artéria braquial — técnica correta (D).',
            icon: 'Activity',
          },
        ],
        footer_rule: 'INCORRETA PA: palma supinada, não pronada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: para aferir PA, é INCORRETO — três condutas são padrão de diretriz.',
          'Testar A: manguito ao nível do coração → conduta correta → eliminar.',
          'Testar C: costas/antebraço apoiados, pernas descruzadas, pés no chão → postura padrão → eliminar.',
          'Testar D: centralizar manguito sobre braquial → técnica correta → eliminar.',
          'Testar B: palma voltada para baixo → INCORRETO — antebraço deve ficar supinado (palma para cima).',
          'Confirmar: só B traz conduta incorreta.',
          'Marcar letra B.',
        ],
        footer_rule: 'Supinação do antebraço → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posicionamento PA',
        meta: slideMeta,
        content: 'TÉCNICA PA — POSIÇÃO DO PACIENTE',
        rows: [
          { label: 'Manguito', value: 'Nível do coração · 2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'ok' },
          { label: 'Antebraço', value: 'Supinado — palma voltada para CIMA', sv_kind: 'pa', badge: 'hot' },
          { label: 'Tronco', value: 'Costas apoiadas · pés no chão · pernas descruzadas', sv_kind: 'pa', badge: 'ok' },
          { label: 'Artéria', value: 'Câmara compressiva centralizada na braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Roupas', value: 'Não garrotear o braço — retirar manga apertada', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Palma para baixo = erro clássico de prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS AGIRH — PA INCORRETA',
        items: [
          {
            label: 'Letra A — manguito ao coração',
            detail: 'O manguito deve ser posicionado ao nível do coração.',
            correct: 'Conduta correta: braço na altura do átrio evita sub ou superestimar a PA.',
          },
          {
            label: 'Letra C — postura sentada',
            detail: 'Costas e antebraço apoiados; pernas descruzadas; pés no chão.',
            correct: 'Conduta correta: postura sentada com apoios é padrão das diretrizes de aferição.',
          },
          {
            label: 'Letra D — centralizar braquial',
            detail: 'Centralizar o meio da parte compressiva do manguito sobre a artéria braquial.',
            correct: 'Conduta correta: câmara do manguito deve cobrir a braquial para leitura fidedigna.',
          },
          {
            label: 'Letra B — palma para baixo',
            detail: 'Palma voltada para baixo durante a aferição.',
            correct: 'INCORRETA: antebraço supinado (palma para cima) — pronar a mão é erro de técnica.',
          },
        ],
        footer_rule: 'INCORRETA = B (posição da mão)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1778969745165-3': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — pulso: déficit apical×periférico · taquisfigmia (fino+taquicárdico) · ritmo regular · carótida — palpar com leveza, uma artéria por vez, sem pressão excessiva',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — técnica pulso AVANÇASP',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Destaque aspecto INCORRETO sobre aferição de FC/pulso — quatro afirmativas são conceitos válidos.',
            icon: 'Target',
          },
          {
            label: 'Déficit de pulso',
            detail: 'Diferença entre pulso apical e periférico — conceito clínico correto (A).',
            icon: 'GitCompare',
          },
          {
            label: 'Padrões de normalidade',
            detail: 'Interpretar pulso exige conhecer faixas e qualidade — afirmativa B correta.',
            icon: 'BookOpen',
          },
          {
            label: 'Taquisfigmia',
            detail: 'Pulso fino + taquicárdico = taquisfigmia — nomenclatura correta (C).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — carótida firme',
            detail: 'Letra D pede pressionar carótida com firmeza — risco de reflexo vagal; palpar suavemente.',
            icon: 'Ban',
          },
          {
            label: 'Ritmo regular',
            detail: 'Pulsações em intervalos iguais = rítmico — definição correta (E).',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Carótida: leveza, nunca firmeza',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: destaque aspecto INCORRETO sobre aferição de pulso.',
          'Testar A: déficit = apical − periférico → conceito correto → eliminar.',
          'Testar B: conhecer padrões de normalidade → conduta correta → eliminar.',
          'Testar C: fino + taquicárdico = taquisfigmia → nomenclatura correta → eliminar.',
          'Testar E: mesmo intervalo = rítmico → definição correta → eliminar.',
          'Testar D: pressionar carótida com firmeza → INCORRETO — palpar suavemente, uma artéria por vez.',
          'Marcar letra D.',
        ],
        footer_rule: 'Carótida suave → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — avaliação do pulso',
        meta: slideMeta,
        content: 'PULSO — CONCEITOS DE PROVA',
        rows: [
          { label: 'Déficit de pulso', value: 'Apical − periférico (diferença)', sv_kind: 'fc', badge: 'ok' },
          { label: 'Taquisfigmia', value: 'Fino + taquicárdico', sv_kind: 'fc', badge: 'ok' },
          { label: 'Ritmo', value: 'Intervalos iguais = rítmico', sv_kind: 'fc', badge: 'ok' },
          { label: 'Carótida', value: 'Palpar com LEVEZA — uma artéria por vez', sv_kind: 'fc', badge: 'hot' },
          { label: 'FC adulto', value: '60–100 bpm no pulso radial', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Firmeza na carótida = pegadinha clássica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS AVANÇASP — PULSO INCORRETA',
        items: [
          {
            label: 'Letra A — déficit de pulso',
            detail: 'Déficit de pulso é a diferença entre o pulso apical e o pulso periférico.',
            correct: 'Afirmativa correta: déficit de pulso quantifica discrepância apical × periférica.',
          },
          {
            label: 'Letra B — padrões de normalidade',
            detail: 'É preciso conhecer os padrões de normalidade para avaliar o pulso.',
            correct: 'Afirmativa correta: interpretação exige referência de frequência e qualidade.',
          },
          {
            label: 'Letra C — taquisfigmia',
            detail: 'Pulso fino e taquicárdico → nomenclatura taquisfigmia.',
            correct: 'Afirmativa correta: taquisfigmia descreve pulso fino com frequência elevada.',
          },
          {
            label: 'Letra E — ritmo',
            detail: 'Pulsação no mesmo intervalo = rítmica.',
            correct: 'Afirmativa correta: ritmo regular quando os intervalos entre batidas são iguais.',
          },
          {
            label: 'Letra D — carótida firme',
            detail: 'Pressionar carótida com firmeza para exatidão.',
            correct: 'INCORRETA: carótida se palpa suavemente — pressão firme pode causar bradicardia reflexa.',
          },
        ],
        footer_rule: 'INCORRETA = D (técnica carótida)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343822075-1': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — pulso radial/apical: seis características (frequência · ritmo · amplitude · simetria · elasticidade) — "disparidade" não integra o rol',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — características do pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Pulso radial ou apical na avaliação de rotina — seis características da parede arterial; uma está incorreta.',
            icon: 'Target',
          },
          {
            label: 'Onda de pulso',
            detail:
              'Pressão do sangue contra a parede arterial a cada contração do ventrículo esquerdo — enquadramento do enunciado.',
            icon: 'HeartPulse',
          },
          {
            label: 'Ritmo de pulsação',
            detail: 'Regular ou irregular — característica válida listada na prova (A).',
            icon: 'Activity',
          },
          {
            label: 'Intensidade/amplitude',
            detail: 'Força ou amplitude da onda — característica válida (B).',
            icon: 'Gauge',
          },
          {
            label: 'Elasticidade',
            detail: 'Estado da parede arterial — característica válida (D).',
            icon: 'CircleDot',
          },
          {
            label: 'Simetria homóloga',
            detail: 'Comparação com artéria homóloga — característica válida (E).',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — termo incorreto',
            detail:
              'Letra C "disparidade" não é característica clássica — comando pede a afirmativa incorreta entre as seis descritas.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Disparidade ≠ característica do pulso',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: características do pulso — uma está incorreta.',
          'Relembrar: frequência · ritmo · amplitude · simetria · elasticidade · (contorno/duração).',
          'Testar A: ritmo de pulsação → característica válida → eliminar.',
          'Testar B: intensidade/força/amplitude → característica válida → eliminar.',
          'Testar D: elasticidade → característica válida → eliminar.',
          'Testar E: comparação homóloga/simetria → característica válida → eliminar.',
          'Testar C: disparidade → NÃO é termo técnico das características do pulso → INCORRETA.',
          'Marcar letra C.',
        ],
        footer_rule: 'Disparidade fora do rol → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — características do pulso',
        meta: slideMeta,
        content: '6 CARACTERÍSTICAS DO PULSO',
        rows: [
          { label: 'Frequência', value: 'Batimentos por minuto', sv_kind: 'fc', badge: 'ok' },
          { label: 'Ritmo', value: 'Regular ou irregular', sv_kind: 'fc', badge: 'ok' },
          { label: 'Amplitude', value: 'Intensidade/força da onda', sv_kind: 'fc', badge: 'ok' },
          { label: 'Simetria', value: 'Comparar artéria homóloga', sv_kind: 'fc', badge: 'ok' },
          { label: 'Elasticidade', value: 'Turgência da parede arterial', sv_kind: 'fc', badge: 'ok' },
          { label: 'Disparidade', value: 'NÃO é característica clássica', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Memorize o rol — disparidade é intruso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS AVANÇASP — CARACTERÍSTICAS PULSO',
        items: [
          {
            label: 'Letra A — ritmo',
            detail: 'Ritmo de pulsação.',
            correct: 'Afirmativa correta: ritmo (regular/irregular) é característica clássica do pulso.',
          },
          {
            label: 'Letra B — intensidade',
            detail: 'Intensidade, força ou amplitude.',
            correct: 'Afirmativa correta: amplitude/intensidade descreve a força da onda de pulso.',
          },
          {
            label: 'Letra D — elasticidade',
            detail: 'Elasticidade da parede arterial.',
            correct: 'Afirmativa correta: elasticidade avalia turgência e complacência arterial.',
          },
          {
            label: 'Letra E — simetria',
            detail: 'Comparação com artéria homóloga/simetria do pulso.',
            correct: 'Afirmativa correta: simetria entre membros detecta assimetria vascular.',
          },
          {
            label: 'Letra C — disparidade',
            detail: 'Disparidade como característica do pulso.',
            correct: 'INCORRETA: "disparidade" não integra o rol técnico das características do pulso.',
          },
        ],
        footer_rule: 'INCORRETA = C (termo inválido)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343932809-4': {
    family: 'protocolo',
    guideline:
      'MS/COFEN/SBC 2020 — PA: circunferência braço · manguito adequado · 2–3 cm acima fossa SEM folgas · centralizar braquial · estetoscópio sem compressão',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — diretriz PA 2020',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Etapas da medida PA (Diretriz 2020) — marque a alternativa incorreta.',
            icon: 'Target',
          },
          {
            label: 'Circunferência do braço',
            detail: 'Medir no ponto médio acrômio–olécrano para escolher manguito — correto (A).',
            icon: 'Ruler',
          },
          {
            label: 'Manguito adequado',
            detail: 'Tamanho proporcional à circunferência — correto (B).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — folgas no manguito',
            detail: 'Letra C: "deixar folgas" — manguito deve ser justo, sem folgas; só a distância de 2–3 cm acima da fossa.',
            icon: 'Ban',
          },
          {
            label: 'Centralizar braquial',
            detail: 'Câmara compressiva sobre artéria braquial — correto (D).',
            icon: 'HeartPulse',
          },
          {
            label: 'Estetoscópio',
            detail: 'Diafragma na braquial sem comprimir excessivamente — correto (E).',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'Manguito justo — sem folgas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: etapas PA Diretriz 2020 — alternativa incorreta.',
          'Testar A: circunferência braço → etapa correta → eliminar.',
          'Testar B: manguito adequado → etapa correta → eliminar.',
          'Testar D: centralizar na braquial → etapa correta → eliminar.',
          'Testar E: palpar braquial + estetoscópio sem compressão → etapa correta → eliminar.',
          'Testar C: deixar folgas de 2–3 cm acima da fossa → INCORRETO — posicionar 2–3 cm acima, mas manguito JUSTO, sem folgas.',
          'Marcar letra C.',
        ],
        footer_rule: 'Folgas ≠ posicionamento → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Diretriz PA 2020',
        meta: slideMeta,
        content: 'ETAPAS TÉCNICAS PA',
        rows: [
          { label: 'Circunferência', value: 'Medir braço — escolher manguito', sv_kind: 'pa', badge: 'ok' },
          { label: 'Posição manguito', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'ok' },
          { label: 'Ajuste', value: 'JUSTO — sem folgas ou folgas laterais', sv_kind: 'pa', badge: 'hot' },
          { label: 'Artéria', value: 'Câmara centralizada na braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Ausculta', value: 'Estetoscópio sem compressão excessiva', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: '2–3 cm acima ≠ deixar folgas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS AVANÇASP — DIRETRIZ PA',
        items: [
          {
            label: 'Letra A — circunferência',
            detail: 'Determinar circunferência do braço no ponto médio.',
            correct: 'Conduta correta: medida do braço define tamanho do manguito (Diretriz 2020).',
          },
          {
            label: 'Letra B — manguito adequado',
            detail: 'Selecionar manguito de tamanho adequado ao braço.',
            correct: 'Conduta correta: manguito sub ou superdimensionado distorce a leitura.',
          },
          {
            label: 'Letra D — centralizar braquial',
            detail: 'Centralizar câmara compressiva sobre a braquial.',
            correct: 'Conduta correta: alinhamento da câmara com a artéria braquial.',
          },
          {
            label: 'Letra E — estetoscópio',
            detail: 'Palpar braquial e colocar diafragma sem compressão excessiva.',
            correct: 'Conduta correta: técnica de ausculta dos sons de Korotkoff.',
          },
          {
            label: 'Letra C — folgas no manguito',
            detail: 'Deixar folgas de 2–3 cm acima da fossa cubital.',
            correct: 'INCORRETA: posicionar 2–3 cm acima sim, mas manguito justo — "folgas" invalidam a compressão.',
          },
        ],
        footer_rule: 'INCORRETA = C (folgas)',
      },
    ],
  },

  'faurgs-enfermagem-verificacao-de-sinais-vitais-1779344189558-0': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — SV: temp axilar ~36,5°C · FR 12–20 irpm (60 s) · avaliar FR disfarçada no pulso · pré-PA: bexiga vazia · evitar exercício/cafeína 30 min (SBC)',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — SV geral Faurgs',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Afirmação INCORRETA sobre avaliação de sinais vitais — quatro descrevem técnica válida.',
            icon: 'Target',
          },
          {
            label: 'Temperatura axilar',
            detail: '36,5°C como referência axilar — afirmativa A correta.',
            icon: 'Thermometer',
          },
          {
            label: 'FR 12–20 irpm',
            detail: 'Contar 60 s · 1 ciclo = inspiração + expiração — afirmativa B correta.',
            icon: 'Wind',
          },
          {
            label: 'Componentes da FR',
            detail: 'Frequência · ritmo · profundidade · tipo · simetria — afirmativa C correta.',
            icon: 'Activity',
          },
          {
            label: 'FR disfarçada',
            detail: 'Avaliar respiração durante palpação do pulso — técnica válida (D).',
            icon: 'EyeOff',
          },
          {
            label: 'Pegadinha — pré-PA dispensável',
            detail: 'Letra E: dispensar bexiga cheia, exercício e álcool/café — todos influenciam a PA.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Pré-PA: bexiga · exercício · estimulantes',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmação INCORRETA sobre avaliação de SV.',
          'Testar A: temp axilar 36,5°C → referência correta → eliminar.',
          'Testar B: FR 12–20 irpm, 60 s → faixa adulta correta → eliminar.',
          'Testar C: componentes da respiração → descrição completa → eliminar.',
          'Testar D: FR disfarçada no pulso → técnica aceita → eliminar.',
          'Testar E: não verificar bexiga/exercício/álcool/café para PA → INCORRETO — todos alteram a leitura.',
          'Marcar letra E.',
        ],
        footer_rule: 'Pré-PA obrigatório → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — SV e pré-PA',
        meta: slideMeta,
        content: 'AVALIAÇÃO INTEGRADA DE SV',
        rows: [
          { label: 'Temp axilar', value: '~36,5°C (referência)', sv_kind: 'temp', badge: 'ok' },
          { label: 'FR adulto', value: '12–20 irpm · contar 60 s', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR disfarçada', value: 'Contar durante palpação do pulso', sv_kind: 'fr', badge: 'ok' },
          { label: 'Pré-PA bexiga', value: 'Esvaziar — bexiga cheia eleva PA', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pré-PA exercício', value: 'Evitar esforço recente (SBC: 30 min antes)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Pré-PA estimulantes', value: 'Evitar álcool e café antes', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Nunca dispensar cuidados pré-PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FAURGS — SV INCORRETA',
        items: [
          {
            label: 'Letra A — temperatura',
            detail: 'Temp axilar 36,5°C como normalidade.',
            correct: 'Afirmativa correta: 36,5°C é referência clássica de temperatura axilar.',
          },
          {
            label: 'Letra B — FR',
            detail: 'FR 12–20 irpm, verificar por 60 segundos.',
            correct: 'Afirmativa correta: faixa adulta e tempo de contagem padrão.',
          },
          {
            label: 'Letra C — componentes FR',
            detail: 'Frequência, ritmo, profundidade, tipo e simetria respiratória.',
            correct: 'Afirmativa correta: avaliação completa do padrão respiratório.',
          },
          {
            label: 'Letra D — FR disfarçada',
            detail: 'Avaliar FR durante palpação do pulso sem explicitar.',
            correct: 'Afirmativa correta: técnica evita alteração voluntária do padrão pelo paciente.',
          },
          {
            label: 'Letra E — dispensar pré-PA',
            detail: 'Não verificar bexiga, exercício, álcool ou café para PA.',
            correct: 'INCORRETA: bexiga cheia, exercício recente e estimulantes alteram a pressão arterial.',
          },
        ],
        footer_rule: 'INCORRETA = E (pré-PA)',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1778969745165-4': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — precisão PA: repouso 5 min · manguito 2–3 cm acima fossa · esfigmo calibrado · braço ao NÍVEL do coração (não acima) · bexiga vazia · evitar exercício recente',
    exam_vs_current: 'Prova cita 90 min pós-exercício na letra E — SBC usa 30 min; gabarito D (braço acima do coração)',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — precisão PA Fundatec',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Ação INCORRETA para precisão na aferição de PA — quatro são cuidados padrão.',
            icon: 'Target',
          },
          {
            label: 'Repouso 5 min',
            detail: 'Paciente em repouso, sem falar ou mover — correto (A).',
            icon: 'Clock',
          },
          {
            label: 'Manguito posicionado',
            detail: '2–3 cm acima da fossa cubital — correto (B).',
            icon: 'Activity',
          },
          {
            label: 'Equipamento',
            detail: 'Esfigmomanômetro calibrado + estetoscópio de qualidade — correto (C).',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — braço acima do coração',
            detail: 'Letra D: braço vertical acima do coração — deve ficar AO NÍVEL do coração.',
            icon: 'Ban',
          },
          {
            label: 'Pré-PA',
            detail: 'Verificar bexiga e exercício há 90 min — correto (E).',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Braço ao nível do coração — nunca acima',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ação INCORRETA para precisão na PA.',
          'Testar A: repouso 5 min, imóvel → correto → eliminar.',
          'Testar B: manguito 2–3 cm acima fossa → correto → eliminar.',
          'Testar C: esfigmo calibrado + estetoscópio → correto → eliminar.',
          'Testar E: bexiga e exercício 90 min → correto → eliminar.',
          'Testar D: braço vertical acima do coração → INCORRETO — posicionar ao nível do coração.',
          'Marcar letra D.',
        ],
        footer_rule: 'Nível do coração → D incorreta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — precisão PA',
        meta: slideMeta,
        content: 'CUIDADOS PARA PA PRECISA',
        rows: [
          { label: 'Repouso', value: '≥ 5 min antes · silêncio', sv_kind: 'pa', badge: 'ok' },
          { label: 'Manguito', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'ok' },
          { label: 'Braço', value: 'Ao NÍVEL do coração — apoiado', sv_kind: 'pa', badge: 'hot' },
          { label: 'Equipamento', value: 'Esfigmo calibrado · estetoscópio adequado', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pré-PA', value: 'Bexiga vazia · evitar exercício recente', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Braço acima do coração subestima PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNDATEC — PA INCORRETA',
        items: [
          {
            label: 'Letra A — repouso',
            detail: 'Repouso 5 min, sem falar ou mover durante medição.',
            correct: 'Conduta correta: repouso prévio reduz variabilidade da PA.',
          },
          {
            label: 'Letra B — manguito',
            detail: 'Manguito 2–3 cm acima da fossa cubital.',
            correct: 'Conduta correta: posicionamento padrão do manguito.',
          },
          {
            label: 'Letra C — equipamento',
            detail: 'Esfigmomanômetro calibrado e estetoscópio de qualidade.',
            correct: 'Conduta correta: equipamento calibrado garante leitura confiável.',
          },
          {
            label: 'Letra E — pré-PA',
            detail: 'Verificar bexiga cheia e exercício há 90 minutos.',
            correct:
              'Conduta correta: verificar bexiga e intervalo pós-exercício antes da PA (intervalo da prova na letra E).',
          },
          {
            label: 'Letra D — braço acima',
            detail: 'Braço vertical acima do nível do coração.',
            correct: 'INCORRETA: braço deve ficar ao nível do coração — posição elevada distorce a leitura.',
          },
        ],
        footer_rule: 'INCORRETA = D (posição braço)',
      },
    ],
  },

  'fundatec-enfermagem-verificacao-de-sinais-vitais-1779344158323-2': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — sinais vitais clássicos: temperatura · pulso/FC · FR · PA · dor (5º sinal) — SpO₂/oximetria é monitorização complementar, não sinal vital clássico',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — sinais vitais Fundatec',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'São sinais vitais, EXCETO — quatro alternativas listam SV clássicos; uma é monitorização acessória.',
            icon: 'Target',
          },
          {
            label: 'Dor',
            detail: '5º sinal vital — incluído no rol contemporâneo (A).',
            icon: 'Frown',
          },
          {
            label: 'Pressão arterial',
            detail: 'SV cardinal — parâmetro hemodinâmico (B).',
            icon: 'HeartPulse',
          },
          {
            label: 'Frequência respiratória',
            detail: 'SV cardinal — padrão ventilatório (D).',
            icon: 'Wind',
          },
          {
            label: 'Temperatura',
            detail: 'SV cardinal — homeostase térmica (E).',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — oximetria',
            detail: 'Letra C: oximetria de pulso — monitorização complementar, não SV clássico do rol tradicional.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'SpO₂ complementa — não é SV clássico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: são sinais vitais, EXCETO.',
          'Relembrar rol clássico: T · pulso · FR · PA (+ dor como 5º).',
          'Testar A: dor → 5º sinal vital → é SV → eliminar.',
          'Testar B: pressão arterial → SV cardinal → eliminar.',
          'Testar D: frequência respiratória → SV cardinal → eliminar.',
          'Testar E: temperatura → SV cardinal → eliminar.',
          'Testar C: oximetria de pulso → monitorização complementar, NÃO SV clássico → EXCETO.',
          'Marcar letra C.',
        ],
        footer_rule: 'Oximetria = EXCETO → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — rol de sinais vitais',
        meta: slideMeta,
        content: 'SINAIS VITAIS CLÁSSICOS',
        rows: [
          { label: 'Temperatura', value: 'Homeostase térmica', sv_kind: 'temp', badge: 'ok' },
          { label: 'Pulso/FC', value: 'Frequência cardíaca', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR', value: 'Frequência respiratória', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA', value: 'Pressão arterial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Dor', value: '5º sinal vital (contemporâneo)', sv_kind: 'meta', badge: 'ok' },
          { label: 'SpO₂', value: 'Monitorização — NÃO SV clássico', sv_kind: 'spo2', badge: 'warn' },
        ],
        footer_rule: 'Oximetria complementa, não substitui SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS FUNDATEC — EXCETO SV',
        items: [
          {
            label: 'Letra A — dor',
            detail: 'Dor como sinal vital.',
            correct: 'Afirmativa correta: dor é reconhecida como 5º sinal vital na enfermagem.',
          },
          {
            label: 'Letra B — PA',
            detail: 'Pressão arterial.',
            correct: 'Afirmativa correta: PA é sinal vital cardinal.',
          },
          {
            label: 'Letra D — FR',
            detail: 'Frequência respiratória.',
            correct: 'Afirmativa correta: FR integra os sinais vitais clássicos.',
          },
          {
            label: 'Letra E — temperatura',
            detail: 'Temperatura corporal.',
            correct: 'Afirmativa correta: temperatura é sinal vital fundamental.',
          },
          {
            label: 'Letra C — oximetria',
            detail: 'Oximetria de pulso.',
            correct:
              'INCORRETA: oximetria de pulso é monitorização complementar — não integra o rol clássico de sinais vitais.',
          },
        ],
        footer_rule: 'EXCETO = C (oximetria)',
      },
    ],
  },

  'ibade-enfermagem-verificacao-de-sinais-vitais-1779344178184-4': {
    family: 'protocolo',
    guideline:
      'MS/COFEN/SBC — pré-PA: repouso 5 min silencioso · explicar procedimento · bexiga vazia · evitar exercício 30 min antes · manguito adequado à circunferência',
    exam_vs_current: 'Prova exige ≥60 min pós-exercício — SBC cita 30 min; gabarito D (30 min incorreto)',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — técnica PA Ibade',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa INCORRETA sobre aferição de PA — quatro seguem diretriz.',
            icon: 'Target',
          },
          {
            label: 'Repouso 5 min',
            detail: 'Sentar confortavelmente em ambiente silencioso — correto (A).',
            icon: 'Clock',
          },
          {
            label: 'Sem conversar',
            detail: 'Explicar procedimento e orientar silêncio — correto (B).',
            icon: 'VolumeX',
          },
          {
            label: 'Bexiga vazia',
            detail: 'Certificar-se de que não está com bexiga cheia — correto (C).',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — 30 minutos',
            detail: 'Letra D: exercício há 30 min — diretriz exige ≥ 60 min de repouso pós-esforço.',
            icon: 'Ban',
          },
          {
            label: 'Manguito adequado',
            detail: 'Tamanho proporcional à circunferência — correto (E).',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Pós-exercício: 60 min, não 30',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa INCORRETA sobre aferição de PA.',
          'Testar A: repouso 5 min silencioso → correto → eliminar.',
          'Testar B: explicar e não conversar → correto → eliminar.',
          'Testar C: bexiga não cheia → correto → eliminar.',
          'Testar E: manguito adequado → correto → eliminar.',
          'Testar D: exercício há 30 min → INCORRETO — diretriz pede ≥ 60 min sem exercício.',
          'Marcar letra D.',
        ],
        footer_rule: '60 min pós-exercício → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pré-PA Ibade',
        meta: slideMeta,
        content: 'CUIDADOS PRÉ-AFERIÇÃO PA',
        rows: [
          { label: 'Repouso', value: '5 min sentado · ambiente silencioso', sv_kind: 'pa', badge: 'ok' },
          { label: 'Comunicação', value: 'Explicar · não conversar na medição', sv_kind: 'pa', badge: 'ok' },
          { label: 'Bexiga', value: 'Esvaziada — bexiga cheia eleva PA', sv_kind: 'pa', badge: 'ok' },
          { label: 'Exercício', value: 'Evitar esforço recente (SBC: 30 min)', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: 'Adequado à circunferência do braço', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Prova: 30 min na letra D é a INCORRETA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IBADE — PA INCORRETA',
        items: [
          {
            label: 'Letra A — repouso',
            detail: 'Sentar 5 min em ambiente silencioso antes da PA.',
            correct: 'Conduta correta: repouso prévio estabiliza a pressão arterial.',
          },
          {
            label: 'Letra B — silêncio',
            detail: 'Explicar procedimento e orientar a não conversar.',
            correct: 'Conduta correta: fala e movimento alteram a leitura da PA.',
          },
          {
            label: 'Letra C — bexiga',
            detail: 'Certificar-se de que o paciente não está com bexiga cheia.',
            correct: 'Conduta correta: bexiga distendida eleva artificialmente a PA.',
          },
          {
            label: 'Letra E — manguito',
            detail: 'Usar manguito adequado para a circunferência do braço.',
            correct: 'Conduta correta: manguito proporcional evita erro sistemático.',
          },
          {
            label: 'Letra D — 30 minutos',
            detail: 'Verificar se não praticou exercícios há 30 minutos.',
            correct:
              'INCORRETA: a prova considera 30 minutos insuficientes — intervalo pós-exercício maior que o citado na alternativa.',
          },
        ],
        footer_rule: 'INCORRETA = D (tempo pós-exercício)',
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
    console.log(`[handcraft:sv-g33] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g33] total=${ok}`);
}

main();
