#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g34 (vitals_exceto_tecnica batch 2: 8 slugs).
 * Cluster EXCETO/INCORRETA — técnica SV · âncora AVANÇASP PA divergente.
 *
 *   npm run handcraft:sinais-vitais-g34
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g34';
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
    'FR disfarçada · terminologia clínica',
    'rol clássico de sinais vitais',
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
  'idecan-enfermagem-verificacao-de-sinais-vitais-1780066924385-6': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — terminologia SV: pirexia (febre) · hipertensão · taquisfigmia = alteração; eupneia = respiração normal (não indica alteração)',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — terminologia clínica IDECAN',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Terminologias que indicam alteração nos dados vitais, EXCETO — três nomes apontam desvio; um descreve normalidade.',
            icon: 'Target',
          },
          {
            label: 'Pirexia',
            detail: 'Febre — alteração da temperatura corporal (A).',
            icon: 'Thermometer',
          },
          {
            label: 'Hipertensão',
            detail: 'PA elevada — alteração hemodinâmica (C).',
            icon: 'HeartPulse',
          },
          {
            label: 'Taquisfigmia',
            detail: 'Pulso fino e taquicárdico — alteração de FC/qualidade (D).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — eupneia',
            detail: 'Eupneia = respiração normal e confortável — NÃO indica alteração vital.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Eupneia é normalidade respiratória, não patologia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terminologias de alteração nos dados vitais, EXCETO.',
          'Testar A: pirexia → febre = alteração térmica → eliminar.',
          'Testar C: hipertensão → PA elevada = alteração → eliminar.',
          'Testar D: taquisfigmia → pulso alterado = alteração → eliminar.',
          'Testar B: eupneia → respiração NORMAL, sem sinal de alteração → EXCETO.',
          'Marcar letra B.',
        ],
        footer_rule: 'Eupneia = normal → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — terminologia SV',
        meta: slideMeta,
        content: 'ALTERAÇÃO × NORMALIDADE — TERMOS DE PROVA',
        rows: [
          { label: 'Pirexia', value: 'Febre — alteração térmica', sv_kind: 'temp', badge: 'ok' },
          { label: 'Hipertensão', value: 'PA elevada — alteração', sv_kind: 'pa', badge: 'ok' },
          { label: 'Taquisfigmia', value: 'Pulso fino + taquicárdico', sv_kind: 'fc', badge: 'ok' },
          { label: 'Eupneia', value: 'Respiração NORMAL — não é alteração', sv_kind: 'fr', badge: 'hot' },
          { label: 'Dispneia', value: 'Falta de ar — alteração respiratória', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Eupneia ≠ dispneia — normal vs alterado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IDECAN — TERMINOLOGIA EXCETO',
        items: [
          {
            label: 'Letra A — pirexia',
            detail: 'Pirexia.',
            correct: 'Afirmativa correta: pirexia designa febre — indica alteração da temperatura.',
          },
          {
            label: 'Letra C — hipertensão',
            detail: 'Hipertensão.',
            correct: 'Afirmativa correta: hipertensão arterial é alteração do sinal pressórico.',
          },
          {
            label: 'Letra D — taquisfigmia',
            detail: 'Taquisfigmia.',
            correct: 'Afirmativa correta: taquisfigmia descreve pulso fino com frequência elevada — alteração.',
          },
          {
            label: 'Letra B — eupneia',
            detail: 'Eupneia.',
            correct: 'EXCEÇÃO: eupneia significa respiração normal — não indica alteração nos dados vitais.',
          },
        ],
        footer_rule: 'EXCETO = B (eupneia normal)',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779343897104-7': {
    family: 'protocolo',
    guideline:
      'SBC/MS — pré-PA: repouso ≥ 5 min silencioso · bexiga vazia · postura sentada apoiada · braço ao nível do coração · palma supinada',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — pré-PA Consulplan',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Hipertensão arterial (HA) — preparo da pressão arterial sistêmica; SBC 2023; assinale a INCORRETA entre os cuidados de investigação diagnóstica.',
            icon: 'Target',
          },
          {
            label: 'Bexiga vazia',
            detail: 'Verificar bexiga cheia antes da PA — cuidado prévio correto (A).',
            icon: 'Droplets',
          },
          {
            label: 'Postura sentada',
            detail: 'Pernas descruzadas, pés no chão, costas apoiadas — postura padrão (B).',
            icon: 'Armchair',
          },
          {
            label: 'Braço posicionado',
            detail: 'Altura do coração, palma para cima, sem garrotear — técnica correta (C).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — dispensar repouso',
            detail: 'Letra D: repouso prévio "não necessário" — diretriz exige repouso antes da medida.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Hipertensão arterial — SBC 2023: repouso pré-PA obrigatório',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidados preparo PA — afirmativa INCORRETA (SBC/HA).',
          'Testar A: verificar bexiga cheia → cuidado correto → eliminar.',
          'Testar B: postura sentada apoiada → cuidado correto → eliminar.',
          'Testar C: braço ao coração, palma supinada → técnica correta → eliminar.',
          'Testar D: repouso antes do exame não necessário → INCORRETO — exige-se repouso prévio (≥ 5 min).',
          'Marcar letra D.',
        ],
        footer_rule: 'Repouso pré-PA → D incorreta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo PA SBC',
        meta: slideMeta,
        content: 'CUIDADOS PRÉ-AFERIÇÃO PA',
        rows: [
          { label: 'Repouso', value: '≥ 5 min · ambiente calmo · silêncio', sv_kind: 'pa', badge: 'hot' },
          { label: 'Bexiga', value: 'Esvaziada — bexiga cheia eleva PA', sv_kind: 'pa', badge: 'ok' },
          { label: 'Postura', value: 'Sentado · costas apoiadas · pés no chão', sv_kind: 'pa', badge: 'ok' },
          { label: 'Braço', value: 'Nível do coração · palma para cima', sv_kind: 'pa', badge: 'ok' },
          { label: 'Durante', value: 'Não falar nem mover-se na medição', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Pressão arterial sistêmica — investigação diagnóstica exige repouso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — PREPARO PA (HA/SBC)',
        items: [
          {
            label: 'Letra A — bexiga',
            detail: 'Verificar se o paciente não está com a bexiga cheia.',
            correct: 'Conduta correta: bexiga distendida eleva artificialmente a pressão arterial.',
          },
          {
            label: 'Letra B — postura',
            detail: 'Sentar com pernas descruzadas, pés apoiados, dorso relaxado.',
            correct: 'Conduta correta: postura sentada com apoios estabiliza a leitura da PA.',
          },
          {
            label: 'Letra C — braço',
            detail: 'Braço na altura do coração, palma para cima, sem garrotear.',
            correct: 'Conduta correta: posicionamento padrão do membro superior para aferição.',
          },
          {
            label: 'Letra D — repouso dispensável',
            detail: 'Repousar antes do exame não é necessário.',
            correct: 'INCORRETA: repouso prévio (≥ 5 min) é exigido — dispensá-lo invalida a acurácia.',
          },
        ],
        footer_rule: 'INCORRETA = D (repouso)',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344122526-0': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — fatores que aumentam FR: dor · anemia (hipóxia) · tabagismo crônico; broncodilatadores dilatam brônquios — não aumentam FR',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — fatores que aumentam FR',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Fatores que contribuem para aumento da FR, EXCETO — três elevam a frequência; um age no brônquio, não na FR.',
            icon: 'Target',
          },
          {
            label: 'Dor',
            detail: 'Estímulo doloroso eleva FR por estresse — fator válido (A).',
            icon: 'Frown',
          },
          {
            label: 'Anemia',
            detail: 'Hipóxia tecidual compensada por taquipneia — fator válido (B).',
            icon: 'Droplets',
          },
          {
            label: 'Tabagismo crônico',
            detail: 'Doença pulmonar crônica altera padrão respiratório — fator válido (C).',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — broncodilatador',
            detail: 'Broncodilatadores relaxam musculatura brônquica — não são fator de aumento de FR.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Broncodilatador ≠ taquipneia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: fatores que aumentam FR, EXCETO.',
          'Testar A: dor → aumenta FR por estresse/dor → eliminar.',
          'Testar B: anemia → hipóxia → taquipneia compensatória → eliminar.',
          'Testar C: tabagismo crônico → alteração pulmonar → pode elevar FR → eliminar.',
          'Testar D: broncodilatadores → dilatam brônquios, não aumentam FR → EXCETO.',
          'Marcar letra D.',
        ],
        footer_rule: 'Broncodilatador fora da lista → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR e fatores influentes',
        meta: slideMeta,
        content: 'FATORES QUE ALTERAM A FR',
        rows: [
          { label: 'Dor', value: 'Estímulo doloroso → taquipneia', sv_kind: 'fr', badge: 'ok' },
          { label: 'Anemia', value: 'Hipóxia → compensação ventilatória', sv_kind: 'fr', badge: 'ok' },
          { label: 'Tabagismo', value: 'DPOC/alteração crônica pulmonar', sv_kind: 'fr', badge: 'ok' },
          { label: 'Broncodilatador', value: 'Dilata brônquio — NÃO aumenta FR', sv_kind: 'fr', badge: 'hot' },
          { label: 'FR adulto', value: '12–20 irpm eupneico', sv_kind: 'fr', badge: 'ok' },
        ],
        footer_rule: 'Diferencie broncodilatação de taquipneia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — FR EXCETO',
        items: [
          {
            label: 'Letra A — dor',
            detail: 'Dor.',
            correct: 'Afirmativa correta: dor é estímulo que pode elevar a frequência respiratória.',
          },
          {
            label: 'Letra B — anemia',
            detail: 'Anemia.',
            correct: 'Afirmativa correta: anemia reduz O₂ transportado — organismo compensa com taquipneia.',
          },
          {
            label: 'Letra C — tabagismo',
            detail: 'Tabagismo crônico.',
            correct: 'Afirmativa correta: tabagismo crônico altera função pulmonar e pode elevar FR.',
          },
          {
            label: 'Letra D — broncodilatadores',
            detail: 'Uso de broncodilatadores.',
            correct: 'EXCEÇÃO: broncodilatadores relaxam brônquios — não são fator de aumento da FR.',
          },
        ],
        footer_rule: 'EXCETO = D (broncodilatador)',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344137078-6': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — técnica FR: contar 60 s · FR disfarçada (paciente não perceber) · inconsciente também se afere · estetoscópio não é padrão quantitativo de FR',
    roi_error: 'fr_disfarcada_tecnica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica FR — cuidado correto',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Cuidado na aferição da frequência respiratória — marque a conduta técnica adequada.',
            icon: 'Target',
          },
          {
            label: 'FR disfarçada',
            detail: 'Paciente nao deve perceber a avaliacao — evita inducao da ventilacao (D).',
            icon: 'EyeOff',
          },
          {
            label: 'Pegadinha — inconsciente',
            detail: 'Letra A erra ao dispensar FR em inconsciente — SV se aferem sempre.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — estetoscopio na FR',
            detail: 'Letra B: estetoscopio nao e metodo padrao para contar a frequencia respiratoria.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — oximetria substitui FR',
            detail: 'Letra C: oximetria de pulso complementa, mas nao substitui contagem da FR.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'FR disfarçada = técnica de ouro em prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidado correto na aferição da FR.',
          'Eliminar A: não aferir FR em inconscientes → FALSO — FR é sinal vital obrigatório.',
          'Eliminar B: estetoscópio para FR quantitativa → não é técnica padrão de contagem.',
          'Eliminar C: confiar só na oximetria → complementa, não substitui contagem manual.',
          'Confirmar D: paciente não deve perceber — evita indução da ventilação (FR disfarçada).',
          'Marcar letra D.',
        ],
        footer_rule: 'FR disfarçada → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica de FR',
        meta: slideMeta,
        content: 'AFERIÇÃO DA FREQUÊNCIA RESPIRATÓRIA',
        rows: [
          { label: 'Tempo', value: 'Contar 60 segundos (1 ciclo = insp + exp)', sv_kind: 'fr', badge: 'ok' },
          { label: 'FR disfarçada', value: 'Paciente NÃO perceber a contagem', sv_kind: 'fr', badge: 'hot' },
          { label: 'Inconsciente', value: 'Aferir FR normalmente', sv_kind: 'fr', badge: 'ok' },
          { label: 'Estetoscópio', value: 'Não é método padrão de contagem FR', sv_kind: 'fr', badge: 'warn' },
          { label: 'Oximetria', value: 'Complementa — não substitui observação', sv_kind: 'spo2', badge: 'ok' },
        ],
        footer_rule: 'Contar sem o paciente perceber',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — TECNICA FR (DISFARCADA)',
        items: [
          {
            label: 'Letra A — nao aferir inconsciente',
            detail: 'Em pacientes inconscientes, nao se deve aferir a frequencia respiratoria.',
            correct: 'Afirmativa falsa: FR deve ser aferida em todo paciente, inclusive inconsciente.',
          },
          {
            label: 'Letra B — estetoscopio na FR',
            detail: 'Utilizar estetoscopio para melhor afericao quantitativa da FR.',
            correct: 'Afirmativa falsa: contar a FR e por observacao do torax — estetoscopio nao e padrao.',
          },
          {
            label: 'Letra C — oximetria substitui FR',
            detail: 'Oximetria de pulso substitui a contagem da frequencia respiratoria.',
            correct: 'Afirmativa falsa: oximetria complementa, mas nao substitui observacao direta da FR.',
          },
          {
            label: 'Letra D — FR disfarçada',
            detail: 'Paciente nao deve perceber a avaliacao respiratoria.',
            correct: 'Conduta correta: FR disfarçada evita inducao da ventilacao pelo paciente.',
          },
        ],
        footer_rule: 'Técnica correta = D',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344137078-7': {
    family: 'protocolo',
    guideline:
      'MS/COFEN/SBC — manguito PA: 2–3 cm ACIMA da fossa cubital (não em cima) · justo sem folgas · centralizar braquial · tamanho adequado',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — técnica manguito PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Cuidados na PA para acurácia — assinale a INCORRETA; três seguem diretriz.',
            icon: 'Target',
          },
          {
            label: 'Manguito adequado',
            detail: 'Tamanho proporcional ao braço (adulto/pediátrico/obeso) — correto (A).',
            icon: 'Ruler',
          },
          {
            label: 'Comunicação',
            detail: 'Explicar procedimento e posição confortável — correto (B).',
            icon: 'MessageCircle',
          },
          {
            label: 'Posição do braço',
            detail: 'Apoiado, palma para cima, cotovelo fletido, nível do coração — correto (D).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — sobre a fossa',
            detail: 'Letra C: manguito "em cima da fossa cubital" — deve ficar 2–3 cm ACIMA, não sobre a fossa.',
            icon: 'Ban',
          },
        ],
        footer_rule: '2–3 cm acima da fossa — nunca sobre ela',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: cuidados PA — afirmativa INCORRETA.',
          'Testar A: manguito adequado ao braço → correto → eliminar.',
          'Testar B: explicar e posicionar confortavelmente → correto → eliminar.',
          'Testar D: braço apoiado, palma supinada, nível coração → correto → eliminar.',
          'Testar C: manguito em cima da fossa cubital → INCORRETO — posicionar 2–3 cm acima da fossa.',
          'Marcar letra C.',
        ],
        footer_rule: 'Sobre a fossa = erro → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posicionamento manguito',
        meta: slideMeta,
        content: 'MANGUITO — POSIÇÃO CORRETA',
        rows: [
          { label: 'Altura', value: '2–3 cm ACIMA da fossa cubital', sv_kind: 'pa', badge: 'hot' },
          { label: 'Ajuste', value: 'Justo — sem folgas laterais', sv_kind: 'pa', badge: 'ok' },
          { label: 'Artéria', value: 'Câmara centralizada na braquial', sv_kind: 'pa', badge: 'ok' },
          { label: 'Tamanho', value: 'Proporcional à circunferência do braço', sv_kind: 'pa', badge: 'ok' },
          { label: 'Erro clássico', value: 'Instalar SOBRE a fossa cubital', sv_kind: 'pa', badge: 'warn' },
        ],
        footer_rule: 'Acima da fossa, nunca em cima dela',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — PA INCORRETA',
        items: [
          {
            label: 'Letra A — manguito adequado',
            detail: 'Manguito de tamanho adequado ao braço.',
            correct: 'Conduta correta: manguito proporcional evita erro sistemático de leitura.',
          },
          {
            label: 'Letra B — explicar procedimento',
            detail: 'Explicar o procedimento e posicionar confortavelmente.',
            correct: 'Conduta correta: comunicação e conforto fazem parte da técnica de aferição.',
          },
          {
            label: 'Letra D — braço posicionado',
            detail: 'Braço apoiado, palma para cima, à altura do coração.',
            correct: 'Conduta correta: posicionamento padrão do membro superior para PA.',
          },
          {
            label: 'Letra C — sobre a fossa',
            detail: 'Instalar manguito em cima da fossa cubital.',
            correct: 'INCORRETA: manguito deve ficar 2–3 cm acima da fossa cubital — não sobre ela.',
          },
        ],
        footer_rule: 'INCORRETA = C (posição manguito)',
      },
    ],
  },

  'instituto-consulplan-enfermagem-verificacao-de-sinais-vitais-1779344137078-8': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — sinais vitais clássicos: temperatura · pulso/FC · FR · PA; diurese é eliminação renal — não é sinal vital cardinal',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — sinais vitais admissão',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'São sinais vitais, EXCETO — três parâmetros cardinais; um é função renal/eliminatória.',
            icon: 'Target',
          },
          {
            label: 'Respiração',
            detail: 'FR — sinal vital cardinal (B).',
            icon: 'Wind',
          },
          {
            label: 'Temperatura',
            detail: 'Homeostase térmica — SV cardinal (C).',
            icon: 'Thermometer',
          },
          {
            label: 'Pressão arterial',
            detail: 'Parâmetro hemodinâmico — SV cardinal (D).',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — diurese',
            detail: 'Diurese = volume urinário — função renal, não sinal vital clássico.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Diurese ≠ sinal vital',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: são sinais vitais, EXCETO.',
          'Testar B: respiração → SV cardinal → eliminar.',
          'Testar C: temperatura → SV cardinal → eliminar.',
          'Testar D: pressão arterial → SV cardinal → eliminar.',
          'Testar A: diurese → eliminação urinária, NÃO sinal vital clássico → EXCETO.',
          'Marcar letra A.',
        ],
        footer_rule: 'Diurese fora do rol → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — rol de sinais vitais',
        meta: slideMeta,
        content: 'SINAIS VITAIS NA ADMISSÃO',
        rows: [
          { label: 'Temperatura', value: 'SV cardinal', sv_kind: 'temp', badge: 'ok' },
          { label: 'Pulso/FC', value: 'SV cardinal', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR', value: 'SV cardinal', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA', value: 'SV cardinal', sv_kind: 'pa', badge: 'ok' },
          { label: 'Diurese', value: 'Função renal — NÃO SV clássico', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Admissão: T · pulso · FR · PA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS CONSULPLAN — EXCETO SV',
        items: [
          {
            label: 'Letra B — respiração',
            detail: 'Respiração.',
            correct: 'Afirmativa correta: frequência respiratória integra os sinais vitais clássicos.',
          },
          {
            label: 'Letra C — temperatura',
            detail: 'Temperatura.',
            correct: 'Afirmativa correta: temperatura corporal é sinal vital fundamental.',
          },
          {
            label: 'Letra D — pressão arterial',
            detail: 'Pressão arterial.',
            correct: 'Afirmativa correta: PA é parâmetro hemodinâmico cardinal.',
          },
          {
            label: 'Letra A — diurese',
            detail: 'Diurese.',
            correct: 'EXCEÇÃO: diurese é volume urinário/função renal — não integra o rol clássico de sinais vitais.',
          },
        ],
        footer_rule: 'EXCETO = A (diurese)',
      },
    ],
  },

  'integri-brasil-enfermagem-verificacao-de-sinais-vitais-1779344189558-5': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — SV clássicos: temperatura · pulso · FR · PA; pupilas dilatadas = avaliação neurológica — não sinal vital cardinal',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — sinais vitais Integri',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'São considerados sinais vitais, EXCETO — três parâmetros cardinais; um é sinal neurológico.',
            icon: 'Target',
          },
          {
            label: 'Temperatura',
            detail: 'SV cardinal — homeostase térmica (A).',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso',
            detail: 'FC/qualidade de pulso — SV cardinal (B).',
            icon: 'HeartPulse',
          },
          {
            label: 'Pressão sanguínea',
            detail: 'Parâmetro hemodinâmico — SV cardinal (D).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — pupilas',
            detail: 'Pupilas dilatadas = avaliação neurológica — não integra rol clássico de SV.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Pupila ≠ sinal vital clássico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: são sinais vitais, EXCETO.',
          'Testar A: temperatura → SV cardinal → eliminar.',
          'Testar B: pulso → SV cardinal → eliminar.',
          'Testar D: pressão sanguínea → SV cardinal → eliminar.',
          'Testar C: pupilas dilatadas → avaliação neurológica, NÃO SV clássico → EXCETO.',
          'Marcar letra C.',
        ],
        footer_rule: 'Pupilas fora do rol → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — rol de sinais vitais',
        meta: slideMeta,
        content: 'SINAIS VITAIS CLÁSSICOS',
        rows: [
          { label: 'Temperatura', value: 'SV cardinal', sv_kind: 'temp', badge: 'ok' },
          { label: 'Pulso/FC', value: 'SV cardinal', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR', value: 'SV cardinal', sv_kind: 'fr', badge: 'ok' },
          { label: 'PA', value: 'SV cardinal', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pupilas', value: 'Sinal neurológico — NÃO SV clássico', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Pupila entra em neuroavaliação, não em SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS INTEGRI — EXCETO SV',
        items: [
          {
            label: 'Letra A — temperatura',
            detail: 'Temperatura.',
            correct: 'Afirmativa correta: temperatura é sinal vital cardinal.',
          },
          {
            label: 'Letra B — pulso',
            detail: 'Pulso.',
            correct: 'Afirmativa correta: pulso/frequência cardíaca integra os sinais vitais.',
          },
          {
            label: 'Letra D — pressão sanguínea',
            detail: 'Pressão sanguínea.',
            correct: 'Afirmativa correta: pressão arterial é parâmetro vital fundamental.',
          },
          {
            label: 'Letra C — pupilas dilatadas',
            detail: 'Pupilas dilatadas.',
            correct: 'EXCEÇÃO: pupilas dilatadas são avaliação neurológica — não sinal vital clássico.',
          },
        ],
        footer_rule: 'EXCETO = C (pupilas)',
      },
    ],
  },

  'ivin-enfermagem-verificacao-de-sinais-vitais-1779344105099-7': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — PA: manguito 2–3 cm acima fossa · centralizar câmara na BRAQUIAL (não radial) · dispneia · pulso femoral/carótida · RDC ANVISA 145 termômetros mercúrio',
    roi_error: 'exceto_coringa_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — SV geral Ivin',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'SSVV indicam estado de saude (circulatoria, respiratoria, neural, endocrina) — Potter 2018; vigilancia identifica agravo e gravidade.',
            icon: 'Target',
          },
          {
            label: 'Dispneia',
            detail: 'Sensação subjetiva de falta de ar — definição correta (A).',
            icon: 'Wind',
          },
          {
            label: 'Pulso em inconsciente',
            detail: 'Femoral e carótida para paciente inconsciente — correto (B).',
            icon: 'HeartPulse',
          },
          {
            label: 'ANVISA RDC 145',
            detail: 'Proibição termômetros de mercúrio — legislação correta (C).',
            icon: 'Scale',
          },
          {
            label: 'Avaliação da dor',
            detail: 'Características da dor (local, intensidade, tipo…) — correto (E).',
            icon: 'Frown',
          },
          {
            label: 'Pegadinha — artéria radial',
            detail: 'Letra D: centralizar manguito na radial — PA no braço usa artéria BRAQUIAL.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Vigilancia dos SSVV — identificacao precoce de agravo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa incorreta sobre sinais vitais (Potter — funcoes circulatoria e respiratoria).',
          'Testar A: dispneia = falta de ar subjetiva → conceito correto → eliminar.',
          'Testar B: femoral/carótida em inconsciente → locais válidos → eliminar.',
          'Testar C: RDC ANVISA 145 proíbe mercúrio → legislação correta → eliminar.',
          'Testar E: características da dor → avaliação correta → eliminar.',
          'Testar D: manguito centralizado na radial → INCORRETO — câmara sobre artéria BRAQUIAL.',
          'Marcar letra D.',
        ],
        footer_rule: 'Braquial, não radial → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica PA e SV',
        meta: slideMeta,
        content: 'PA NO BRAÇO — SÍTIO CORRETO',
        rows: [
          { label: 'Posição manguito', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'ok' },
          { label: 'Artéria PA braço', value: 'BRAQUIAL — não radial', sv_kind: 'pa', badge: 'hot' },
          { label: 'Ajuste', value: 'Justo — sem folgas', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pulso radial', value: 'Aferição de FC — não de PA', sv_kind: 'fc', badge: 'ok' },
          { label: 'Termômetro', value: 'RDC ANVISA 145 — mercúrio proibido', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Confundir braquial com radial = pegadinha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS IVIN — SV INCORRETA',
        items: [
          {
            label: 'Letra A — dispneia',
            detail: 'Dispneia = sensação subjetiva de falta de ar.',
            correct: 'Afirmativa correta: dispneia pode ou não estar associada à alteração da FR.',
          },
          {
            label: 'Letra B — pulso inconsciente',
            detail: 'Artérias femoral e carótida para pacientes inconscientes.',
            correct: 'Afirmativa correta: locais de fácil palpação quando pulso periférico é difícil.',
          },
          {
            label: 'Letra C — ANVISA',
            detail: 'RDC ANVISA 145 proíbe termômetros de mercúrio.',
            correct: 'Afirmativa correta: legislação nacional proíbe uso de termômetros de mercúrio.',
          },
          {
            label: 'Letra E — dor',
            detail: 'Características da dor: localização, intensidade, tipo, extensão…',
            correct: 'Afirmativa correta: avaliação estruturada da dor como 5º sinal vital.',
          },
          {
            label: 'Letra D — artéria radial',
            detail: 'Centralizar manguito sobre a artéria radial.',
            correct: 'INCORRETA: no braço a PA é auscultada/palpada na artéria BRAQUIAL — radial é para pulso.',
          },
        ],
        footer_rule: 'INCORRETA = D (artéria errada)',
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
    console.log(`[handcraft:sv-g34] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g34] total=${ok}`);
}

main();
