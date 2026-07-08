#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g39 (8 slugs P1 vitals_temperatura batch 1).
 * Novo cluster Temperatura — vias e febre (33 slugs — g39=8, 25 restantes).
 *
 *   npm run handcraft:sinais-vitais-g39
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g39';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Temperatura corporal — vias de aferição e faixas de referência',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'temperatura axilar 36–37,5 °C',
    'febre axilar ≥37,8 °C',
    'hiperpirexia ≥40 °C',
    'hipotermia <35 °C',
    'vias axilar · oral · retal · timpânica',
    'febre contínua · intermitente · remitente',
    'hipotermia reduz FC',
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
  family: 'vf' | 'conceito' | 'protocolo';
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
    pedagogical_branch: 'vitals_temperatura',
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
  'amauc-enfermagem-verificacao-de-sinais-vitais-1779344205200-1': {
    family: 'protocolo',
    guideline:
      'MS — temperatura timpânica/auricular: crianças >6 meses; puxar pavilhão auricular para cima e para trás',
    roi_error: 'faixa_pediatrica_adulto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Timpânica pediátrica — posicionamento',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Medição auricular/timpânica: termômetro no lóbulo da orelha, levemente para cima e para trás — idade mínima da criança.',
            icon: 'Target',
          },
          {
            label: 'Via timpânica',
            detail:
              'Reflete temperatura do tímpano — leitura rápida; exige pavilhão bem posicionado.',
            icon: 'Thermometer',
          },
          {
            label: 'Criança > 6 meses',
            detail:
              'A partir de 6 meses o conduto auditivo permite técnica segura com tração do pavilhão.',
            icon: 'Baby',
          },
          {
            label: 'Tração do pavilhão',
            detail: 'Para cima e para trás — alinha canal auditivo externo com tímpano.',
            icon: 'MoveUp',
          },
          {
            label: 'Pegadinha — idade errada',
            detail: 'Banca troca 6 meses por 1–2 anos ou recém-nascido.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Timpânica pediátrica → tração + >6 meses',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: posicionamento timpânico no lóbulo — puxar para cima e para trás em crianças maiores de qual idade?',
          'Fixar via: timpânica/auricular — técnica pediátrica com tração do pavilhão.',
          'Referência MS: a partir de 6 meses o conduto permite aferição segura.',
          'Testar A — 2 meses: RN/lactente jovem — conduto estreito demais → eliminar.',
          'Testar B — 2 anos: idade válida, mas prova pede limite mínimo, não máximo → eliminar.',
          'Testar C — 3 anos: acima do mínimo — não é o limiar cobrado → eliminar.',
          'Testar D — 1 ano: já pode aferir, mas limite mínimo é menor → eliminar.',
          'Testar E — 6 meses: coincide com referência de início seguro → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Limite mínimo timpânica → letra E (6 meses)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias de temperatura',
        meta: slideMeta,
        content: 'VIAS × CARACTERÍSTICAS',
        rows: [
          { label: 'Timpânica', value: 'Rápida · custo elevado · >6 meses', sv_kind: 'temp', badge: 'hot' },
          { label: 'Axilar', value: '36–37,5 °C normotermia · leitura intermediária', sv_kind: 'temp', badge: 'ok' },
          { label: 'Oral', value: 'Lenta · exige colaboração', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal', value: 'Mais próxima do core · leitura rápida', sv_kind: 'temp', badge: 'ok' },
          { label: 'Febre axilar', value: '≥ 37,8 °C', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Registrar via — faixas diferem entre métodos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IDADE TIMPÂNICA AMAUC',
        items: [
          {
            label: 'Letra A — 2 meses',
            detail: 'Limite muito precoce para timpânica segura.',
            correct:
              'Aos 2 meses o conduto auditivo ainda é estreito — referência pediátrica usa ≥6 meses para tração adequada.',
          },
          {
            label: 'Letra B — 2 anos',
            detail: 'Idade acima do mínimo — não responde ao limiar.',
            correct:
              'Criança de 2 anos já pode ter timpânica, mas o comando pede a idade mínima (6 meses), não qualquer idade válida.',
          },
          {
            label: 'Letra C — 3 anos',
            detail: 'Confunde idade escolar com limite de início.',
            correct:
              '3 anos ultrapassa o limiar — a prova cobra o piso de 6 meses para posicionamento auricular.',
          },
          {
            label: 'Letra D — 1 ano',
            detail: 'Próximo, mas ainda acima do mínimo da banca.',
            correct:
              '1 ano já é candidato clínico, porém a alternativa correta é 6 meses — menor idade aceita na referência.',
          },
        ],
        footer_rule: 'Só E fecha o limiar de 6 meses',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344117207-4': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — temperatura oral: leitura lenta, risco de contaminação por fluidos, contraindicada se não colabora ou inconsciente',
    exam_vs_current: 'exam_oral_7min_ameosc — enunciado cita leitura ~7 min para via oral',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via oral — tempo e contraindicação',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Local de leitura lenta (~7 min), risco de contaminação por fluidos, não indicado para paciente que não colabora ou está inconsciente.',
            icon: 'Target',
          },
          {
            label: 'Via oral',
            detail:
              'Termômetro sublingual — exige boca fechada, sem respiração bucal e paciente lúcido.',
            icon: 'Thermometer',
          },
          {
            label: 'Leitura lenta',
            detail: 'Cerca de 7 minutos — método mais demorado entre os comuns.',
            icon: 'Clock',
          },
          {
            label: 'Contaminação',
            detail: 'Saliva e secreções — risco de transmissão se não higienizar.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — trocar via',
            detail: 'Banca oferece timpânica (rápida) ou axilar (sem fluido oral).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Lenta + fluidos + exige colaboração = oral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual via tem leitura lenta (~7 min), risco de contaminação por fluidos e contraindicação em não colaborador/inconsciente?',
          'Critério 1 — tempo: oral é a mais lenta (~7 min).',
          'Critério 2 — fluidos: saliva na cavidade oral.',
          'Critério 3 — colaboração: exige fechar boca e cooperar.',
          'Testar A — timpânica: leitura rápida, sem contato com saliva → eliminar.',
          'Testar B — axilar: leitura intermediária, sem fluido oral → eliminar.',
          'Testar C — retal: rápida, outro sítio — não oral → eliminar.',
          'Testar D — oral: fecha os três critérios → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Oral = lenta + fluidos + colaboração → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias de temperatura',
        meta: slideMeta,
        content: 'COMPARATIVO DAS VIAS',
        rows: [
          { label: 'Oral', value: 'Lenta · fluidos · exige colaboração', sv_kind: 'temp', badge: 'hot' },
          { label: 'Axilar', value: 'Intermediária · segura · amplamente usada', sv_kind: 'temp', badge: 'ok' },
          { label: 'Retal', value: 'Rápida · core · indicada em RN', sv_kind: 'temp', badge: 'ok' },
          { label: 'Timpânica', value: 'Segundos · custo alto · >6 meses', sv_kind: 'temp', badge: 'ok' },
          { label: 'Normotermia axilar', value: '36 – 37,5 °C', sv_kind: 'temp', badge: 'ok' },
        ],
        footer_rule: 'Tempo de leitura ajuda a identificar a via',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIAS AMEOSC BANDEIRANTE',
        items: [
          {
            label: 'Letra A — Timpânica',
            detail: 'Leitura em segundos — oposta à lentidão do enunciado.',
            correct:
              'Timpânica é aferição rápida com termômetro infravermelho — não é leitura lenta nem depende de saliva.',
          },
          {
            label: 'Letra B — Axilar',
            detail: 'Método intermediário sem contato com fluidos orais.',
            correct:
              'Axilar tem leitura intermediária e não expõe a saliva — não atende ao risco de contaminação por fluidos bucais.',
          },
          {
            label: 'Letra C — Retal',
            detail: 'Via central rápida — outro sítio anatômico.',
            correct:
              'Retal reflete temperatura central com leitura rápida — não é o local de leitura lenta com fluidos orais.',
          },
        ],
        footer_rule: 'Só oral fecha lentidão + fluidos',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344224014-4': {
    family: 'protocolo',
    guideline: 'MS — temperatura retal normotermia 36,5–37,5 °C; febre retal ≥38,0 °C',
    exam_vs_current: 'exam_retal_37_38_belmonte — prova usa faixa 37–38 °C como normal retal',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Faixa normal — temperatura retal',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Variações normais de temperatura retal — escolher faixa compatível com o gabarito da banca.',
            icon: 'Target',
          },
          {
            label: 'Via retal',
            detail: 'Método central — costuma registrar ~0,5 °C acima da axilar.',
            icon: 'Thermometer',
          },
          {
            label: 'Faixa da prova',
            detail: '37 °C a 38 °C — intervalo cobrado nesta questão Belmonte.',
            icon: 'CheckCircle',
          },
          {
            label: 'Referência MS atual',
            detail: '36,5–37,5 °C retal normotérmico — diverge do gabarito (registrar em exam_vs_current).',
            icon: 'BookOpen',
          },
          {
            label: 'Pegadinha — faixa axilar',
            detail: 'Letras C e D trazem faixas típicas de axilar, não retal.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Retal na prova → 37–38 °C (gabarito A)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: faixa normal de temperatura retal.',
          'Retal é mais alta que axilar — descartar hipotermia (30–35 °C).',
          'Testar B — 30–35 °C: hipotermia grave, não normal → eliminar.',
          'Testar C — 35,8–37,0 °C: próximo de axilar, baixo para retal → eliminar.',
          'Testar D — 36,3–37,4 °C: faixa axilar típica — não retal da prova → eliminar.',
          'Testar A — 37–38 °C: faixa que a banca aceita como normal retal → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Normal retal na prova → letra A (37–38 °C)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas por via',
        meta: slideMeta,
        content: 'RETAL × AXILAR',
        rows: [
          { label: 'Retal normal (prova)', value: '37 – 38 °C', sv_kind: 'temp', badge: 'hot' },
          { label: 'Retal MS atual', value: '36,5 – 37,5 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Axilar adulto', value: '36 – 37,5 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Febre retal', value: '≥ 38,0 °C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Hipotermia', value: '< 35 °C', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Retal costuma ser ~0,5 °C acima da axilar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXA RETAL BELMONTE',
        items: [
          {
            label: 'Letra B — 30–35 °C',
            detail: 'Intervalo de hipotermia, não normotermia.',
            correct:
              '30–35 °C indica hipotermia grave — impossível ser faixa normal de temperatura retal.',
          },
          {
            label: 'Letra C — 35,8–37,0 °C',
            detail: 'Faixa baixa demais para retal normotérmico.',
            correct:
              '35,8–37,0 °C aproxima-se de axilar fria — retal normotérmico na prova começa em 37 °C.',
          },
          {
            label: 'Letra D — 36,3–37,4 °C',
            detail: 'Confunde faixa axilar com retal.',
            correct:
              '36,3–37,4 °C é típico de axilar afebril — retal normal nesta banca é 37–38 °C.',
          },
        ],
        footer_rule: 'Só A fecha a faixa retal da prova',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344224014-6': {
    family: 'protocolo',
    guideline:
      'MS — temperatura timpânica: aferição rápida (segundos), custo do equipamento elevado',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Timpânica — rapidez e custo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Local de aferição com leitura rápida e custo elevado do equipamento.',
            icon: 'Target',
          },
          {
            label: 'Via timpânica',
            detail:
              'Infravermelho no canal auditivo — resultado em segundos.',
            icon: 'Zap',
          },
          {
            label: 'Custo elevado',
            detail: 'Termômetro digital timpânico — investimento maior que clínico comum.',
            icon: 'DollarSign',
          },
          {
            label: 'Axilar × oral',
            detail: 'Termômetros simples — baratos, porém leitura lenta.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — trocar rapidez',
            detail: 'Oral e axilar são lentas; retal é rápida mas sem custo alto.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Rápida + cara = timpânica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: via com aferição rápida e custo elevado.',
          'Rapidez: timpânica mede em segundos.',
          'Custo: equipamento infravermelho é mais caro que termômetro clínico.',
          'Testar B — axilar: termômetro simples, leitura intermediária → eliminar.',
          'Testar C — retal: rápida, mas custo baixo → eliminar.',
          'Testar D — oral: lenta e barata → eliminar.',
          'Testar A — timpânica: rápida e custo alto → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Rápida + custo alto → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vias × tempo × custo',
        meta: slideMeta,
        content: 'TEMPO DE LEITURA',
        rows: [
          { label: 'Timpânica', value: 'Segundos · custo elevado', sv_kind: 'temp', badge: 'hot' },
          { label: 'Retal', value: 'Rápida · termômetro simples', sv_kind: 'temp', badge: 'ok' },
          { label: 'Axilar', value: 'Intermediária · baixo custo', sv_kind: 'temp', badge: 'ok' },
          { label: 'Oral', value: 'Lenta · baixo custo', sv_kind: 'temp', badge: 'ok' },
          { label: 'Registrar via', value: 'Não comparar métodos sem anotar', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Rapidez ≠ precisão — registrar método',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RAPIDEZ DESCANSO',
        items: [
          {
            label: 'Letra B — Axilar',
            detail: 'Método lento com termômetro de mercúrio/galinstan.',
            correct:
              'Axilar leva tempo intermediário e não exige equipamento caro — não é aferição em segundos.',
          },
          {
            label: 'Letra C — Retal',
            detail: 'Leitura relativamente rápida, mas custo baixo.',
            correct:
              'Retal é relativamente rápida, porém usa termômetro clínico comum — não tem custo elevado de infravermelho.',
          },
          {
            label: 'Letra D — Oral',
            detail: 'Via mais lenta entre as clássicas.',
            correct:
              'Oral é a via mais lenta e usa termômetro simples — oposto de rápida e cara.',
          },
        ],
        footer_rule: 'Só timpânica une rapidez e custo',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344237445-0': {
    family: 'conceito',
    guideline:
      'MS — hipotermia <35 °C reduz frequência cardíaca; exercício e simpático aumentam FC',
    roi_error: 'fc_faixa_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipotermia — efeito no pulso',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Fator que diminui a frequência do pulso (FC).',
            icon: 'Target',
          },
          {
            label: 'Hipotermia',
            detail:
              'Temperatura corporal baixa (<35 °C) — metabolismo e FC caem (bradicardia).',
            icon: 'Snowflake',
          },
          {
            label: 'Exercício',
            detail: 'Aumenta demanda metabólica — eleva FC, não reduz.',
            icon: 'Activity',
          },
          {
            label: 'Simpático',
            detail: 'Atividade simpática acelerada → taquicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — confundir com taqui',
            detail: 'Banca oferece estímulos que aceleram o pulso.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Frio desacelera — calor/estresse aceleram',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual alternativa diminui a frequência do pulso?',
          'Hipotermia: corpo conserva energia — FC cai (bradicardia).',
          'Testar B — exercício curto: aumenta FC → eliminar.',
          'Testar C — aumento simpático: taquicardia → eliminar.',
          'Testar D — levantar e sentar: ortostatismo pode elevar FC → eliminar.',
          'Testar A — hipotermia: único fator que reduz FC → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Hipotermia → bradicardia → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — temperatura × FC',
        meta: slideMeta,
        content: 'FATORES QUE ALTERAM FC',
        rows: [
          { label: 'Hipotermia', value: '< 35 °C — reduz FC', sv_kind: 'temp', badge: 'hot' },
          { label: 'Febre', value: 'Eleva FC ~10 bpm/°C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Exercício', value: 'Aumenta FC', sv_kind: 'fc', badge: 'ok' },
          { label: 'Simpático', value: 'Taquicardia', sv_kind: 'fc', badge: 'ok' },
          { label: 'FC adulto', value: '60 – 100 bpm', sv_kind: 'fc', badge: 'ok' },
        ],
        footer_rule: 'Frio bradica · febre taquicardiza',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FC E TEMPERATURA',
        items: [
          {
            label: 'Letra B — Exercício curta duração',
            detail: 'Estímulo físico agudo.',
            correct:
              'Exercício eleva frequência cardíaca para suprir oxigênio — não diminui o pulso.',
          },
          {
            label: 'Letra C — Aumento simpático',
            detail: 'Resposta de luta ou fuga.',
            correct:
              'Atividade simpática aumentada gera taquicardia — efeito oposto ao pedido no enunciado.',
          },
          {
            label: 'Letra D — Levantar e sentar',
            detail: 'Mudança postural com estresse hemodinâmico.',
            correct:
              'Levantar pode elevar FC por compensação — não é fator de bradicardia como a hipotermia.',
          },
        ],
        footer_rule: 'Só hipotermia reduz FC',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344237445-1': {
    family: 'protocolo',
    guideline:
      'MS/COFEN — temperatura oral: leitura lenta, risco de contaminação por fluidos, contraindicada se não colabora ou inconsciente',
    exam_vs_current: 'exam_oral_7min_ameosc — enunciado cita leitura ~7 min para via oral',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via oral — contraindicações',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Temperatura corporal — local de leitura lenta (enunciado ~7 min), risco de contaminação por fluidos e contraindicação em não colaborador/inconsciente.',
            icon: 'Target',
          },
          {
            label: 'Via oral',
            detail: 'Sublingual — paciente deve cooperar e manter boca fechada.',
            icon: 'Thermometer',
          },
          {
            label: 'Preparo axilar',
            detail:
              'Não aferir temperatura após exercício ou refeição quente — aguardar repouso (referência MS).',
            icon: 'Activity',
          },
          {
            label: 'Inconsciente',
            detail: 'Risco de aspiração e leitura inválida — contraindicada.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — trocar via',
            detail: 'Timpânica é rápida; axilar não expõe a saliva oral.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Lenta + saliva + colaboração = oral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: via lenta (~7 min), contaminação por fluidos, não indicada em não colaborador/inconsciente.',
          'Tempo ~7 min → oral (mais lenta).',
          'Fluidos → cavidade oral/saliva.',
          'Não colabora/inconsciente → contraindica oral.',
          'Testar A — retal: rápida, outro sítio — não lenta oral → eliminar.',
          'Testar B — axilar: sem fluido oral, leitura intermediária → eliminar.',
          'Testar C — timpânica: segundos, sem saliva → eliminar.',
          'Testar D — oral: fecha os três critérios → candidata.',
          'Marcar D.',
        ],
        footer_rule: 'Oral → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — contraindicações por via',
        meta: slideMeta,
        content: 'QUANDO NÃO USAR',
        rows: [
          { label: 'Oral', value: 'Inconsciente · convulsão · respiração bucal', sv_kind: 'temp', badge: 'hot' },
          { label: 'Retal', value: 'Diarreia · hemorroidas · neutropenia', sv_kind: 'temp', badge: 'warn' },
          { label: 'Axilar', value: 'Sudorese excessiva · fricção', sv_kind: 'temp', badge: 'ok' },
          { label: 'Timpânica', value: 'Cerúmen · otite · <6 meses', sv_kind: 'temp', badge: 'ok' },
          { label: 'Hipotermia', value: '< 35 °C', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Escolher via conforme estado do paciente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ORAL GUARACIABA',
        items: [
          {
            label: 'Letra A — Retal',
            detail: 'Via central com outro perfil de tempo.',
            correct:
              'Retal tem leitura rápida e não envolve saliva — não atende leitura lenta com fluidos orais.',
          },
          {
            label: 'Letra B — Axilar',
            detail: 'Método seguro sem contato bucal.',
            correct:
              'Axilar não expõe a fluidos da cavidade oral e é mais rápida que a via oral lenta do enunciado.',
          },
          {
            label: 'Letra C — Timpânica',
            detail: 'Leitura instantânea no ouvido.',
            correct:
              'Timpânica mede em segundos no canal auditivo — não tem lentidão nem contaminação por saliva.',
          },
        ],
        footer_rule: 'Só oral fecha os três critérios',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343822075-0': {
    family: 'conceito',
    guideline:
      'MS — febre contínua: temperatura permanece acima do normal com oscilações ≤1 °C; intermitente alterna normal e febril',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tipos evolutivos de febre',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Febre em que a temperatura permanece sempre acima do normal, com variações de até 1 grau.',
            icon: 'Target',
          },
          {
            label: 'Febre contínua',
            detail: 'Platô febril — oscila ≤1 °C, nunca normaliza.',
            icon: 'Flame',
          },
          {
            label: 'Febre intermitente',
            detail: 'Alterna períodos febris e afebris — retorna ao normal.',
            icon: 'RefreshCw',
          },
          {
            label: 'Febre remitente',
            detail: 'Queda parcial, mas não volta à normotermia completa.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — intermitente',
            detail: 'Banca troca padrão que alterna com afebril.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sempre febril + oscila ≤1 °C = contínua',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tipo de febre com temperatura sempre acima do normal e variação de até 1 grau.',
          'Decodificar: nunca normaliza + pequena oscilação → febre contínua.',
          'Testar B — intermitente: alterna com afebril → eliminar.',
          'Testar C — remitente: queda incompleta, não padrão de platô → eliminar.',
          'Testar D — recorrente: episódios separados por afebril → eliminar.',
          'Testar E — ondulante: grandes oscilações (ex. brucelose) → eliminar.',
          'Testar A — contínua: platô febril com oscilação ≤1 °C → candidata.',
          'Marcar A.',
        ],
        footer_rule: 'Platô febril → letra A (contínua)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — padrões de febre',
        meta: slideMeta,
        content: 'CURVAS FEBRIS',
        rows: [
          { label: 'Contínua', value: 'Sempre febril · oscila ≤1 °C', sv_kind: 'temp', badge: 'hot' },
          { label: 'Intermitente', value: 'Alterna febre e afebril', sv_kind: 'temp', badge: 'ok' },
          { label: 'Remitente', value: 'Queda >1 °C sem normalizar', sv_kind: 'temp', badge: 'ok' },
          { label: 'Recorrente', value: 'Episódios com intervalo afebril', sv_kind: 'temp', badge: 'ok' },
          { label: 'Febre axilar', value: '≥ 37,8 °C', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Contínua ≠ intermitente — observe se normaliza',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CURVAS FEBRIS AVANÇASP',
        items: [
          {
            label: 'Letra B — Febre intermitente',
            detail: 'Padrão com retorno à normotermia.',
            correct:
              'Intermitente alterna febre e temperatura normal — não permanece sempre acima do normal.',
          },
          {
            label: 'Letra C — Febre remitente',
            detail: 'Queda parcial entre picos.',
            correct:
              'Remitente cai mais de 1 °C, mas não volta à normotermia — diferente do platô contínuo.',
          },
          {
            label: 'Letra D — Febre recorrente',
            detail: 'Episódios febris separados por afebril.',
            correct:
              'Recorrente tem intervalos afebris entre surtos — não mantém temperatura sempre elevada.',
          },
          {
            label: 'Letra E — Febre ondulante',
            detail: 'Oscilações amplas em ciclos.',
            correct:
              'Ondulante apresenta variações grandes (ex. ±3–5 °C) — não é oscilação de até 1 grau.',
          },
        ],
        footer_rule: 'Só contínua mantém platô febril',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343865210-3': {
    family: 'conceito',
    guideline: 'MS — hiperpirexia axilar ≥40,0 °C; febre 37,8–38,9 °C; normotermia 36–37,5 °C',
    exam_vs_current: 'exam_axilar_numeric_options — alternativas com valores específicos da prova AVANÇASP',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hiperpirexia — valor axilar',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Valor de temperatura axilar correspondente à hiperpirexia.',
            icon: 'Target',
          },
          {
            label: 'Hiperpirexia',
            detail: 'Pico febril extremo — axilar ≥40 °C (referência MS).',
            icon: 'Flame',
          },
          {
            label: 'Valor da prova',
            detail: 'Única alternativa da lista acima do limiar de hiperpirexia.',
            icon: 'Thermometer',
          },
          {
            label: 'Febre comum',
            detail: 'Faixa febril/febre abaixo de 40 °C — não hiperpirexia.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — febre alta',
            detail: 'Banca oferece febre elevada como distrator de hiperpirexia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hiperpirexia axilar → ≥40 °C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: temperatura axilar de hiperpirexia.',
          'Hiperpirexia MS: ≥40,0 °C axilar.',
          'Testar A — normotérmico → eliminar.',
          'Testar B — limiar de febre, não hiperpirexia → eliminar.',
          'Testar C — febre moderada → eliminar.',
          'Testar D — febre alta, ainda abaixo de 40 °C → eliminar.',
          'Testar E — único valor ≥40 °C na lista → candidata.',
          'Marcar E.',
        ],
        footer_rule: '≥40 °C axilar → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação térmica axilar',
        meta: slideMeta,
        content: 'FAIXAS AXILARES',
        rows: [
          { label: 'Normotermia', value: '36 – 37,5 °C', sv_kind: 'temp', badge: 'ok' },
          { label: 'Febre', value: '37,8 – 38,9 °C', sv_kind: 'temp', badge: 'warn' },
          { label: 'Hiperpirexia', value: '≥ 40,0 °C axilar', sv_kind: 'temp', badge: 'hot' },
          { label: 'Hipotermia', value: '< 35 °C', sv_kind: 'temp', badge: 'warn' },
        ],
        footer_rule: 'Hiperpirexia começa em 40 °C axilar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPERPIREXIA AVANÇASP',
        items: [
          {
            label: 'Letra A — normotérmico',
            detail: 'Valor dentro da faixa de normalidade.',
            correct:
              'Alternativa A está na normotermia axilar — não representa hiperpirexia.',
          },
          {
            label: 'Letra B — início de febre',
            detail: 'Limite inferior da febre axilar.',
            correct:
              'Letra B marca o limiar de febre — muito abaixo do corte de hiperpirexia (40 °C).',
          },
          {
            label: 'Letra C — febre moderada',
            detail: 'Elevação térmica sem hiperpirexia.',
            correct:
              'Febre moderada permanece abaixo de 40 °C — não classifica hiperpirexia.',
          },
          {
            label: 'Letra D — febre alta',
            detail: 'Ainda abaixo do limiar de hiperpirexia.',
            correct:
              'Febre elevada abaixo de 40 °C axilar não é hiperpirexia — D não fecha o critério MS.',
          },
        ],
        footer_rule: 'Só E ultrapassa 40 °C axilar',
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
    console.log(`[handcraft:sv-g39] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g39] total=${ok}`);
}

main();
