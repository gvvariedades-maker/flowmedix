#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g21 (2 slugs · urgencias_choque · lote final 18/18).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  perfusaoRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasChoqueGolden';

const LOTE = 'urgencias-g21';
const REVIEWER = 'handcraft-urgencias-g21';

const CHOQUE_L3_FOOTER =
  'Choque e hipoperfusão — tipos, sinais periféricos e desidratação grave';

const SPECS: Record<string, Pack> = {
  'vunesp-enfermagem-exames-complementares-1779424094915-0': {
    family: 'protocolo',
    guideline:
      'Desidratação no idoso — hipernatremia: mucosas secas, letargia, taquicardia; confirmar com sódio sérico elevado',
    roi_error: 'desidratacao_hipernatremia_idoso',
    cluster: 'Desidratação — hipernatremia e risco de choque hipovolêmico',
    danger_footer: 'Gabarito E — hipernatremia com sódio sérico elevado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Desidratação — hipernatremia',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Idoso com diarreia aquosa — perda hídrica e risco eletrolítico.', icon: 'User' },
          { label: 'Hipovolemia', detail: 'Desidratação reduz volume — pode evoluir para choque hipovolêmico.', icon: 'Droplets' },
          { label: 'Hipernatremia', detail: 'Perda de água livre — sódio sérico elevado na dosagem.', icon: 'FlaskConical' },
          { label: 'Pegadinha — hiponatremia', detail: 'Cefaleia e hipotensão isoladas não fecham o quadro de perda hídrica com mucosas secas.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Desidratação no idoso — completar: distúrbio · sinais · exame:',
          'Eliminar hiponatremia — sódio baixo não é o padrão da desidratação hiperosmolar.',
          'Eliminar hipopotassemia — ECG com ondas T apiculadas não é o foco do enunciado.',
          'Eliminar hiperpotassemia — ondas T achatadas não combinam com diarreia desidratante.',
          'Eliminar hipomagnesemia — Trousseau/Chvostek negativos não descrevem o caso.',
          'Hipernatremia — febre, mucosas secas, letargia, taquicardia e sódio sérico elevado — marcar E.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DESIDRATAÇÃO — SÓDIO',
        rows: [
          { label: 'Hipernatremia', value: 'Perda de água > perda de sódio — sódio sérico alto', badge: 'hot' },
          { label: 'Sinais', value: 'Mucosas secas, letargia, taquicardia, hipertensão inicial', badge: 'warn' },
          { label: 'Choque', value: 'Desidratação grave → hipovolemia e hipoperfusão', badge: 'ok' },
          { label: 'Monitor', value: 'Sinais vitais contínuos + eletrólitos séricos', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DESIDRATAÇÃO E SÓDIO',
        items: [
          {
            label: 'Pegadinha — hiponatremia',
            detail: 'Cefaleia e hipotensão com sódio baixo parecem fechar o quadro.',
            correct: 'Desidratação com perda hídrica eleva o sódio — hipernatremia, gabarito E.',
          },
          {
            label: 'Alt. B — hipopotassemia',
            detail: 'ECG com ondas T apiculadas sugere distúrbio de potássio.',
            correct: 'Foco do caso é desidratação e sódio — não hipopotassemia.',
          },
          {
            label: 'Alt. C — hiperpotassemia',
            detail: 'Ondas T achatadas e ondas U apontam para potássio alto.',
            correct: 'Diarreia desidratante no idoso — suspeitar hipernatremia.',
          },
          {
            label: 'Alt. D — hipomagnesemia',
            detail: 'Trousseau e Chvostek negativos com magnésio baixo.',
            correct: 'Mucosas secas, letargia e taquicardia — hipernatremia.',
          },
        ],
        footer_rule: 'Monitorar sódio sérico na desidratação grave',
      },
    ],
  },
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563491765-3': {
    family: 'conceito',
    guideline: 'Choque hipovolêmico — pele pálida, fria e pegajosa por vasoconstrição e hipoperfusão',
    roi_error: 'choque_hipovolemico_pele_fria',
    cluster: 'Semiologia — sinal sugestivo de choque hipovolêmico',
    danger_footer: 'Gabarito B — pele pálida, fria e pegajosa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque hipovolêmico — sinal',
        meta: slideMeta,
        items: [
          { label: 'Mecanismo', detail: 'Perda de volume intravascular — débito cardíaco inadequado.', icon: 'Droplets' },
          { label: 'Hipoperfusão', detail: 'Organos mal perfundidos — pele reflete vasoconstrição.', icon: 'HeartPulse' },
          { label: 'Pele fria', detail: 'Pálida, fria e pegajosa — sinal clássico em prova.', icon: 'Thermometer' },
          { label: 'Pegadinha — hipertensão', detail: 'PA elevada não caracteriza choque hipovolêmico estabelecido.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinal sugestivo de choque hipovolêmico:',
          'Eliminar refluxo hepatojugular — congestão venosa, perfil cardiogênico.',
          'Eliminar sinal de Haller — achado torácico, não perfusão periférica.',
          'Eliminar hipertensão arterial — choque evolui com hipotensão.',
          'Eliminar dor precordial isolada — não define hipoperfusão sistêmica.',
          'Pele pálida, fria e pegajosa — marcar B.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIPOVOLÊMICO — SINAIS',
        rows: perfusaoRows(),
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563491765-3': {
    A: 'Refluxo hepatojugular sugere congestão venosa — mais cardiogênico que hipovolêmico.',
    C: 'Sinal de Haller é achado torácico — não sinal de choque hipovolêmico.',
    D: 'Hipertensão não caracteriza choque hipovolêmico estabelecido.',
    E: 'Dor precordial isolada não define hipoperfusão periférica do choque.',
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
    console.log(`[handcraft:urgencias-g21] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g21] total=${ok}`);
}

main();
