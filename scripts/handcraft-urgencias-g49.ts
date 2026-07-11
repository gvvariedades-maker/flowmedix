#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g49 (3 slugs · orphan-reconcile 339/339).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';

const LOTE = 'urgencias-g49';
const REVIEWER = 'handcraft-urgencias-g49';
const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const CHOQUE_FOOTER = 'Choque elétrico — desenergizar antes de tocar';

const TVP_ROWS = [
  { label: 'Sinal precoce', value: 'Dor e/ou cãibra na panturrilha — membro acometido', badge: 'hot' },
  { label: 'Prevenção', value: 'Deambulação precoce · meias compressivas · mobilização segura', badge: 'ok' },
  { label: '× Rolos no joelho', value: 'Comprime poplíteo — favorece estase venosa', badge: 'warn' },
  { label: '× Pernas pendentes', value: 'Estase em paciente obeso — aumenta risco', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca contraindica mobilização ou atrasa compressão', badge: 'info' },
];

const EMBOLIA_GASOSA_ROWS = [
  { label: 'Mecanismo', value: 'Bolhas de gás obstruem fluxo sanguíneo — embolia gasosa', badge: 'hot' },
  { label: 'Pós-cirúrgico', value: 'VM com barotrauma pode introduzir ar no sangue', badge: 'ok' },
  { label: '× Trombo arterial', value: 'Embolia sólida — não gasosa', badge: 'warn' },
  { label: '× Ateroma poplíteo', value: 'Doença arterial crônica — não embolia gasosa aguda', badge: 'info' },
  { label: 'Pegadinha', value: 'Banca troca gasosa por trombose ou isquemia', badge: 'warn' },
];

type Branch = 'choque' | 'generico';
type Entry = { branch: Branch; pack: unknown; danger: Record<string, string> };

const SPECS: Record<string, Entry> = {
  'vunesp-enfermagem-processo-de-enfermagem-1780003637054-7': {
    branch: 'choque',
    pack: {
      family: 'protocolo',
      guideline:
        'Choque elétrico — interromper fonte com segurança, evitar contato direto, acionar emergência e iniciar ressuscitação após ambiente seguro',
      roi_error: 'choque_eletrico_seguranca_rcp',
      cluster: 'Choque elétrico — conduta inicial',
      danger_footer: 'Gabarito E',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Choque elétrico — oficina',
          meta: choqueSlideMeta,
          items: [
            { label: 'Risco', detail: 'Vítima energizada — contato direto eletrocuta o socorrista.', icon: 'Zap' },
            { label: '1ª conduta', detail: 'Interromper fonte elétrica com segurança.', icon: 'Power' },
            { label: 'Depois', detail: 'Acionar emergência · avaliar · RCP se necessário.', icon: 'Phone' },
            { label: '× Contato', detail: 'Tocar · puxar · água · metal — conduzem corrente.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'RCP ou pulso antes de desenergizar a cena.', icon: 'AlertTriangle' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Choque elétrico no chão da oficina — conduta inicial?',
            'Segurança da cena: desenergizar antes de qualquer contato.',
            'Eliminar tocar para pulso — energiza o socorrista.',
            'Eliminar água · puxar vítima · ferramenta metálica — conduzem corrente.',
            'E: interromper fonte + evitar contato + emergência + RCP após ambiente seguro.',
            'Marcar E.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          meta: choqueSlideMeta,
          content: 'ELÉTRICO — SEQUÊNCIA',
          rows: [
            { label: '1º', value: 'Desenergizar — não tocar na vítima', badge: 'hot' },
            { label: '2º', value: 'Acionar emergência', badge: 'ok' },
            { label: '3º', value: 'RCP após ambiente seguro', badge: 'info' },
            { label: '× Água/metal', value: 'Conduzem eletricidade — proibido na aproximação', badge: 'warn' },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: choqueSlideMeta,
          content: 'PEGADINHAS — choque elétrico',
          items: [
            {
              label: 'Letra A — tocar para pulso',
              detail: 'Tocar a vítima energizada antes de desenergizar.',
              correct: 'Contato direto eletrocuta o socorrista — desenergizar primeiro (E).',
            },
            {
              label: 'Letra B — água no sistema',
              detail: 'Lançar água para resfriar cabos energizados.',
              correct: 'Água conduz corrente — aumenta risco de choque no socorrista (E).',
            },
            {
              label: 'Letra C — puxar pelos membros',
              detail: 'Afastar vítima puxando sem isolar a fonte.',
              correct: 'Puxar mantém circuito fechado — usar isolamento/desenergização (E).',
            },
            {
              label: 'Letra D — ferramenta metálica',
              detail: 'Deslocar cabos com metal condutor.',
              correct: 'Metal conduz eletricidade — desenergizar com segurança antes (E).',
            },
          ],
          footer_rule: 'Gabarito E — desenergizar antes de tocar',
        },
      ],
    },
    danger: {},
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103981770-6': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Embolia gasosa pós-cirúrgica — trauma pulmonar por ventilação mecânica pode introduzir ar no sangue e obstruir fluxo',
      roi_error: 'embolia_gasosa_vm_barotrauma',
      cluster: 'Embolia gasosa — motivação pós-cirúrgica',
      danger_footer: 'Gabarito A — trauma pulmonar por VM',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Embolia gasosa',
          meta: genericoSlideMeta,
          items: [
            { label: 'Definição', detail: 'Gás no sangue obstruindo fluxo — embolia gasosa.', icon: 'Wind' },
            { label: 'Contexto', detail: 'Paciente pós-cirúrgico na clínica cirúrgica.', icon: 'Hospital' },
            { label: 'VM', detail: 'Barotrauma pulmonar pode introduzir ar na circulação.', icon: 'Activity' },
            { label: '× Trombo', detail: 'Embolia sólida arterial — não bolhas de gás.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Banca troca gasosa por trombose ou ateroma.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Embolia gasosa pós-cirúrgica — possível motivação?',
            'Gás no sangue sugere entrada de ar — pensar em barotrauma/VM.',
            'Eliminar trombos arteriais — embolia sólida, não gasosa.',
            'Eliminar parto normal · ateroma poplíteo · oclusão isquêmica genérica.',
            'A trauma pulmonar por ventilação mecânica — marcar A.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Embolia gasosa — decore',
          meta: genericoSlideMeta,
          content: 'EMBOLIA GASOSA',
          rows: EMBOLIA_GASOSA_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Trombos nas artérias formam embolia sólida — não explica gás obstruindo fluxo sanguíneo.',
      C: 'Parto normal relaciona-se a outras embolias — não ao gás pós-cirúrgico com VM.',
      D: 'Ateroma no poplíteo é doença arterial crônica — não causa embolia gasosa aguda.',
      E: 'Oclusão isquêmica genérica não especifica bolhas de gás — VM com barotrauma sim (A).',
    },
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-6': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'TVP pós-operatória — dor e/ou cãibra na panturrilha pode ser o primeiro sintoma; prevenção inclui mobilização e compressão venosa',
      roi_error: 'tvp_pos_operatorio_sintoma_prevencao',
      cluster: 'TVP pós-cirúrgica — sintoma e prevenção',
      danger_footer: 'Gabarito B — dor/cãibra panturrilha',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TVP pós-cirúrgica',
          meta: genericoSlideMeta,
          items: [
            { label: 'TVP', detail: 'Trombose venosa profunda — complicação grave pós-cirurgia.', icon: 'Activity' },
            { label: 'Sinal precoce', detail: 'Dor e/ou cãibra na panturrilha do membro acometido.', icon: 'Footprints' },
            { label: 'Prevenção', detail: 'Deambulação precoce · meias compressivas · evitar estase.', icon: 'PersonStanding' },
            { label: '× Rolos no joelho', detail: 'Comprime veia poplítea — favorece trombose.', icon: 'Ban' },
            { label: 'Pegadinha', detail: 'Banca contraindica mobilização ou atrasa meia compressiva.', icon: 'AlertTriangle' },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'TVP pós-operatória — afirmativa correta?',
            'Sintoma inicial típico: dor/cãibra na panturrilha — B verdadeira.',
            'Eliminar A — rolos sob joelhos comprimem poplítea e aumentam estase.',
            'Eliminar C — adiar meia compressiva sem indicação clínica não é conduta preventiva padrão.',
            'Eliminar D — pernas pendentes prolongam estase venosa.',
            'Eliminar E — deambulação precoce é prevenção, não contraindicação.',
            'Marcar B.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'TVP — sinais e prevenção',
          meta: genericoSlideMeta,
          content: 'TVP PÓS-OP',
          rows: TVP_ROWS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — TVP pós-operatória',
          items: [
            {
              label: 'Letra A — rolos sob joelhos',
              detail: 'Rolos de cobertor ou travesseiros comprimem a fossa poplítea.',
              correct: 'Comprime veia poplítea e favorece estase — não previne TVP (B).',
            },
            {
              label: 'Letra C — atrasar meia compressiva',
              detail: 'Propõe iniciar compressão venosa apenas após período prolongado.',
              correct: 'Prevenção de TVP inclui compressão precoce conforme protocolo — gabarito B.',
            },
            {
              label: 'Letra D — pernas pendentes',
              detail: 'Paciente obeso sentado à beira do leito com pernas para fora.',
              correct: 'Estase venosa prolongada aumenta risco de TVP — gabarito B.',
            },
            {
              label: 'Letra E — contraindicar deambulação',
              detail: 'Deambulação precoce e exercícios contraindicados por histórico de TVP.',
              correct: 'Mobilização precoce é medida preventiva — gabarito B.',
            },
          ],
          footer_rule: 'Gabarito B — dor/cãibra panturrilha',
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

function writeEntry(slug: string, entry: Entry, raw: unknown) {
  const path = join(loteQuestionsDir(LOTE), `${slug}.json`);
  const dangerMap = { [slug]: entry.danger };

  if (entry.branch === 'choque') {
    const q = raw as ChoqueQ;
    const pack = entry.pack as ChoquePack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaChoque(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeChoque(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  } else {
    const q = raw as GenericoQ;
    const pack = entry.pack as GenericoPack;
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          meta: metaGenerico(q, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
          question_data: q.question_data,
          reverse_study_slides: finalizeGenerico(slug, q, pack, dangerMap),
          modulo_slug: q.modulo_slug ?? slug,
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  }
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  for (const slug of Object.keys(SPECS)) {
    const raw = readQuestaoJson(join(dir, `${slug}.json`));
    writeEntry(slug, SPECS[slug], raw);
    console.log(`[handcraft:urgencias-g49] OK ${slug} (${SPECS[slug].branch})`);
  }
  console.log(`[handcraft:urgencias-g49] ${Object.keys(SPECS).length} slugs golden-v1`);
}

main();
