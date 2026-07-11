#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g23 (4 slugs · urgencias_engasgo · lote final 12/12).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  ovaceRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasEngasgoGolden';

const LOTE = 'urgencias-g23';
const REVIEWER = 'handcraft-urgencias-g23';

const ENGASGO_L3_FOOTER =
  'Engasgo e OVACE — sinal universal no pescoço, Heimlich no adulto consciente';

const SPECS: Record<string, Pack> = {
  'instituto-verbena-enfermagem-urgencias-e-emergencias-1777104031822-2': {
    family: 'protocolo',
    guideline: 'OVACE consciente — manobra de Heimlich; não Valsalva nem Sellick',
    roi_error: 'ovace_consciente_heimlich_verbena',
    cluster: 'Obstrução VA — consciente com corpo estranho',
    danger_footer: 'Gabarito B — manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'OVACE — consciente',
        meta: slideMeta,
        items: [
          { label: 'Urgência', detail: 'Obstrução de via aérea exige intervenção imediata.', icon: 'AlertTriangle' },
          { label: 'Consciente', detail: 'Vítima responde — manobra de Heimlich indicada.', icon: 'User' },
          { label: 'Heimlich', detail: 'Compressões abdominais para expulsar corpo estranho.', icon: 'Hand' },
          { label: 'Pegadinha — Valsalva', detail: 'Manobra expiratória — não desobstrui traqueia.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Obstrução por corpo estranho — acidentado consciente — manobra:',
          'Eliminar Valsalva — força expiração, não remove objeto.',
          'Eliminar Sellick — pressão cricóide em intubação, não engasgo.',
          'Eliminar Osler — percussão diagnóstica, não desobstrução.',
          'Manobra de Heimlich — marcar B.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CONSCIENTE — HEIMLICH',
        rows: ovaceRows(),
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008210115-7': {
    family: 'protocolo',
    guideline: 'Engasgo por sólido — compressão abdominal (Heimlich); não líquido nem varredura às cegas',
    roi_error: 'engasgo_solido_heimlich_ps',
    cluster: 'Primeiros socorros — engasgo material sólido',
    danger_footer: 'Gabarito D — compressão abdominal Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Engasgo — primeiros socorros',
        meta: slideMeta,
        items: [
          { label: 'Engasgo', detail: 'Obstrução das vias aéreas por material sólido.', icon: 'Wind' },
          { label: 'Heimlich', detail: 'Compressão abdominal para desobstruir — manobra clássica.', icon: 'Hand' },
          { label: 'Pegadinha — líquido', detail: 'Ingerir líquido não expulsa corpo estranho sólido.', icon: 'Ban' },
          { label: 'Pegadinha — dedos', detail: 'Varredura às cegas pode impactar objeto na traqueia.', icon: 'AlertTriangle' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pessoa engasgada com sólido — ação de primeiros socorros:',
          'Eliminar ingerir líquido — não desobstrui e pode piorar aspiração.',
          'Eliminar só bater nas costas em pé — adulto consciente usa Heimlich (criança alterna).',
          'Eliminar retirar sem visualizar — varredura digital perigosa.',
          'Compressão abdominal (Heimlich) — marcar D.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SÓLIDO — NÃO FAZER',
        rows: [
          { label: 'Evitar', value: 'Líquido · dedos às cegas · atrasar manobra', badge: 'hot' },
          { label: 'Fazer', value: 'Heimlich em adulto consciente com obstrução grave', badge: 'ok' },
          { label: 'Criança', value: 'Golpes nas costas alternados com abdome', badge: 'warn' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056600234-9': {
    family: 'conceito',
    guideline: 'Heimlich — atrás da vítima em pé, compressões abdominais firmes para dentro e para cima',
    roi_error: 'heimlich_tecnica_descricao',
    cluster: 'Heimlich — descrição técnica da manobra',
    danger_footer: 'Gabarito D — compressões abdominais atrás da vítima',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Heimlich — técnica',
        meta: slideMeta,
        items: [
          { label: 'Objetivo', detail: 'Manobra leiga para OVACE — salvar vidas em engasgo.', icon: 'HeartPulse' },
          { label: 'Posição', detail: 'Socorrista atrás da vítima em pé.', icon: 'Users' },
          { label: 'Movimento', detail: 'Compressões firmes para dentro e para cima no abdome.', icon: 'Hand' },
          { label: 'Pegadinha — sucção', detail: 'Pressão negativa na boca não substitui compressão abdominal.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Heimlich consiste em:',
          'Eliminar sucção boca/nariz — não é técnica de desobstrução.',
          'Eliminar forçar cabeça para baixo sentado — não é protocolo Heimlich.',
          'Eliminar palpar ictus para golpes — confunde com outra manobra.',
          'Eliminar compressões com cabeça mais baixa deitado — posição incorreta.',
          'Atrás da vítima em pé, compressões abdominais firmes — marcar D.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HEIMLICH — PASSOS',
        rows: [
          { label: 'Posição', value: 'Em pé · socorrista atrás', badge: 'hot' },
          { label: 'Mãos', value: 'Punho fechado acima do umbigo', badge: 'ok' },
          { label: 'Direção', value: 'Para dentro e para cima', badge: 'warn' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103988389-4': {
    family: 'protocolo',
    guideline: 'OVACE grave responsiva — Heimlich imediato; tosse só em obstrução parcial',
    roi_error: 'ovace_grave_domiciliar_heimlich',
    cluster: 'Visita domiciliar — engasgo grave adulto responsivo',
    danger_footer: 'Gabarito B — executar manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Engasgo domiciliar — grave',
        meta: slideMeta,
        items: [
          { label: 'Cenário', detail: 'Adulto responsivo com obstrução grave de vias aéreas.', icon: 'Home' },
          { label: 'Grave', detail: 'Não é obstrução parcial com tosse eficaz.', icon: 'AlertTriangle' },
          { label: 'Heimlich', detail: 'Compressão abdominal imediata pelo técnico.', icon: 'Hand' },
          { label: 'Pegadinha — tosse', detail: 'Incentivar tosse só quando parcial e produtiva.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'OVACE grave — vítima responsiva — conduta do TE:',
          'Eliminar tosse rigorosa — obstrução grave exige manobra ativa.',
          'Eliminar compressões torácicas deitado — sem parada cardíaca estabelecida.',
          'Eliminar só observar em decúbito lateral — atraso perigoso.',
          'Eliminar Fowler e dedos na boca — varredura cega contraindicada.',
          'Executar manobra de Heimlich — marcar B.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PARCIAL × GRAVE',
        rows: ovaceRows([
          { label: 'Parcial', value: 'Tosse eficaz — encorajar', badge: 'info' },
          { label: 'Grave', value: 'Heimlich se consciente', badge: 'hot' },
        ]),
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'instituto-verbena-enfermagem-urgencias-e-emergencias-1777104031822-2': {
    A: 'Valsalva força expiração — não remove corpo estranho da traqueia.',
    C: 'Sellick é pressão cricóide na intubação — não manobra de engasgo.',
    D: 'Osler é percussão diagnóstica — não desobstrução de OVACE.',
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008210115-7': {
    A: 'Líquido não expulsa sólido impactado — pode piorar aspiração.',
    B: 'Golpes nas costas isolados em adulto não substituem Heimlich na obstrução grave.',
    C: 'Varredura digital às cegas empurra o objeto — contraindicada.',
  },
  'vunesp-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056600234-9': {
    A: 'Sucção na boca não é técnica Heimlich validada.',
    B: 'Forçar cabeça para baixo sentado não descreve a manobra.',
    C: 'Ictus cordis é localização cardíaca — não Heimlich.',
    E: 'Compressões deitado com cabeça baixa — posição incorreta.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103988389-4': {
    A: 'Tosse rigorosa é para obstrução parcial — grave exige Heimlich.',
    C: 'Compressões torácicas indicam parada — não OVACE consciente.',
    D: 'Apenas observar atrasa desobstrução em obstrução grave.',
    E: 'Fowler e dedos na boca — varredura cega perigosa.',
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g23] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g23] total=${ok}`);
}

main();
