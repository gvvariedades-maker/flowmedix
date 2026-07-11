#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g18 (6 slugs · urgencias_xabcde_trauma · lote final 22/22).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  slideMeta,
  xabcdeRows,
  type Pack,
  type Q,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g18';
const REVIEWER = 'handcraft-urgencias-g18';

const TRAUMA_L3_FOOTER =
  'XABCDE trauma — hemorragia e imobilização; queimadura térmica e esmagamento BT16 em módulos à parte';

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-urgencias-e-emergencias-1777103976379-0': {
    family: 'protocolo',
    guideline:
      'Obstrução total de VAA — solicitar ajuda e iniciar manobra de Heimlich; Valsalva é força expiratória, não desobstrução',
    roi_error: 'vaa_obstrucao_total_heimlich',
    cluster: 'ABCDE — letra A obstrução total VAA',
    danger_footer: 'Gabarito C — manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'VAA — obstrução total APH',
        meta: slideMeta,
        items: [
          { label: 'Obstrução total', detail: 'Sem passagem de ar — prioridade imediata na etapa A do trauma.', icon: 'Wind' },
          { label: 'Grupos de risco', detail: 'Crianças, idosos e edentulados — corpos estranhos/alimentos.', icon: 'Users' },
          { label: 'Heimlich', detail: 'Compressões abdominais para expulsar corpo estranho — obstrução total.', icon: 'Hand' },
          { label: 'Pegadinha — Valsalva', detail: 'Manobra expiratória contra glote fechada — não desobstrui VAA.', icon: 'Ban' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Obstrução total de vias aéreas — técnica de desobstrução:',
          'Eliminar manobra de Valsalva — não remove corpo estranho.',
          'Eliminar manobra de Leopold — manobra obstétrica, não VAA.',
          'Eliminar torniquete — controle hemorrágico, não obstrução.',
          'Eliminar massagem cardíaca — indicada em PCR, não OVACE total.',
          'Solicitar ajuda e manobra de Heimlich — marcar C.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VAA — OBSTRUÇÃO TOTAL',
        rows: [
          { label: 'Parcial', value: 'Tosse eficaz — encorajar, não bater nas costas cegamente', badge: 'ok' },
          { label: 'Total', value: 'Heimlich (adulto consciente) + acionar 192', badge: 'hot' },
          { label: '≠ trauma X', value: 'Hemorragia exsanguinante continua prioridade X quando presente', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-4': {
    family: 'protocolo',
    guideline:
      'Choque hipovolêmico por hemorragia APH — reposição volêmica IV rápida após controle inicial; diurético e elevação isolada não restauram volume',
    roi_error: 'choque_hipovolemico_hemorragia_iv',
    cluster: 'Politrauma — choque hipovolêmico hemorragia APH',
    danger_footer: 'Gabarito D — infusão rápida de cristaloide IV',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque hipovolêmico — hemorragia APH',
        meta: slideMeta,
        items: [
          { label: 'Hipovolemia', detail: 'Hemorragia → queda de volume intravascular — perfusão comprometida.', icon: 'Droplet' },
          { label: 'APH pré-hospitalar', detail: 'Técnico estabiliza até suporte avançado — fluido IV quando indicado.', icon: 'Activity' },
          { label: 'Cristaloide IV', detail: 'Reposição volêmica rápida para restaurar circulação (C do XABCDE).', icon: 'Syringe' },
          { label: 'Pegadinha — diurético', detail: 'Elimina volume — agrava hipovolemia hemorrágica.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque hipovolêmico por hemorragia — APH — ação mais apropriada:',
          'Eliminar diurético — perde volume em paciente já hipovolêmico.',
          'Eliminar elevar pernas isoladamente — não repõe volume perdido.',
          'Torniquete pode ser etapa hemostática — mas gabarito cobra reposição volêmica IV.',
          'Infusão rápida de solução salina IV para restaurar volume — marcar D.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHOQUE HIPOVOLÊMICO — TRAUMA',
        rows: [
          { label: 'X/C', value: 'Controlar hemorragia externa primeiro', badge: 'hot' },
          { label: 'Volume', value: 'Cristaloide IV titulado — restaurar perfusão', badge: 'ok' },
          { label: 'Evitar', value: 'Diurético · vasopressor sem hemostasia', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-0': {
    family: 'protocolo',
    guideline:
      'TCE na emergência — anamnese + abordagem de vias aéreas + imobilização cervical; evitar chin lift/decúbito 90° sem indicação',
    roi_error: 'tce_admissao_coluna_vaa',
    cluster: 'TCE — admissão VAA e imobilização cervical',
    danger_footer: 'Gabarito C — história + VAA + coluna cervical',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TCE — admissão na emergência',
        meta: slideMeta,
        items: [
          { label: 'Estabilização', detail: 'Prioridades, intervenções, reavaliação e transporte seguro.', icon: 'Activity' },
          { label: 'Anamnese', detail: 'História orienta riscos ocultos — parte da abordagem inicial.', icon: 'ClipboardList' },
          { label: 'VAA + coluna', detail: 'Abordar vias aéreas com imobilização cervical simultânea.', icon: 'Bone' },
          { label: 'Pegadinha — chin lift', detail: 'Hiperextensão cervical contraindicada em TCE — preferir jaw thrust.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'TCE — função da equipe de enfermagem na admissão:',
          'Eliminar chin lift isolado — risco de lesão medular.',
          'Eliminar decúbito elevado 90° — não é posição padrão trauma craniano agudo.',
          'Eliminar aspiração nasotraqueal rotineira — técnica avançada e riscos faciais.',
          'Eliminar acesso vascular avançado imediato e balanço de 24h como função de admissão trauma.',
          'Obter história, abordar VAA e imobilizar coluna cervical — marcar C.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TCE — ADMISSÃO TRAUMA',
        rows: [
          { label: 'A', value: 'Vias aéreas pérvias + coluna protegida', badge: 'hot' },
          { label: 'História', value: 'Mecanismo, perda de consciência, medicações', badge: 'ok' },
          { label: 'Evitar', value: 'Chin lift · hiperflexão/extensão cervical', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — chin lift e coluna cervical no TCE',
        items: [
          {
            label: 'Pegadinha — chin lift na ventilação',
            detail: 'Manobra de chin lift com hiperextensão cervical no TCE.',
            correct: 'Chin lift hiperextende pescoço — contraindicado; preferir jaw thrust com imobilização.',
          },
          {
            label: 'Alt. B — decúbito 90°',
            detail: 'Cabeça alinhada em decúbito elevado a 90°.',
            correct: 'Decúbito 90° não é posição padrão de admissão trauma craniano agudo.',
          },
          {
            label: 'Alt. D — aspiração nasotraqueal',
            detail: 'Aspiração nasotraqueal rotineira na admissão.',
            correct: 'Aspiração nasotraqueal não é função imediata rotineira na admissão TCE.',
          },
          {
            label: 'Alt. E — acesso vascular avançado',
            detail: 'Acesso vascular avançado e balanço hídrico de 24h na admissão.',
            correct: 'História + VAA + imobilização cervical — gabarito C.',
          },
        ],
        footer_rule: 'Gabarito C — história + VAA + coluna cervical',
      },
    ],
  },
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-8': {
    family: 'protocolo',
    guideline: 'APH básico — avaliação primária segue ABC (vias aéreas, respiração, circulação) antes da secundária',
    roi_error: 'aph_abc_avaliacao_primaria',
    cluster: 'APH básico — protocolo ABC primário',
    danger_footer: 'Gabarito D — ABC vias aéreas, respiração e circulação',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'APH básico — avaliação primária',
        meta: slideMeta,
        items: [
          { label: 'Funções vitais', detail: 'APH prioriza o que mata primeiro — sequência sistemática.', icon: 'HeartPulse' },
          { label: 'ABC', detail: 'Airway · Breathing · Circulation — avaliação primária.', icon: 'ListOrdered' },
          { label: 'Primária × secundária', detail: 'Secundária só após estabilizar A/B/C.', icon: 'ArrowDown' },
          { label: 'Pegadinha — mover antes', detail: 'Movimentação imediata sem avaliação agrava lesão.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'APH básico — avaliação inicial correta:',
          'Eliminar secundária antes das vias aéreas.',
          'Eliminar movimentação imediata sem avaliação.',
          'Eliminar dispensar imobilização só por consciência.',
          'Eliminar ignorar hemorragias externas leves.',
          'Protocolo ABC — vias aéreas, respiração e circulação — marcar D.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'APH — ABC PRIMÁRIO',
        rows: xabcdeRows([
          { label: 'Primária', value: 'A → B → C antes de exame detalhado', badge: 'hot' },
        ]),
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-9': {
    family: 'protocolo',
    guideline: 'Transporte trauma — prancha rígida para suspeita de lesão medular; imobilização não se restringe a fratura exposta',
    roi_error: 'transporte_prancha_rigida_coluna',
    cluster: 'Resgate — prancha rígida lesão medular',
    danger_footer: 'Gabarito D — prancha rígida para lesão na coluna',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Resgate — transporte seguro',
        meta: slideMeta,
        items: [
          { label: 'Técnica de remoção', detail: 'Movimentação coordenada reduz lesão secundária.', icon: 'Users' },
          { label: 'Prancha rígida', detail: 'Imobilização global — suspeita de lesão medular/cervical.', icon: 'Package' },
          { label: 'Imobilização ampla', detail: 'Fratura fechada também exige estabilização — não só exposta.', icon: 'Bone' },
          { label: 'Pegadinha — um socorrista', detail: 'Remoção segura exige equipe mínima coordenada.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Resgate e transporte de vítimas — alternativa correta:',
          'Eliminar transporte sem imobilização para “agilizar”.',
          'Eliminar imobilizar só em fratura exposta.',
          'Eliminar remoção por um único socorrista.',
          'Eliminar transporte sem avaliar segurança do ambiente.',
          'Prancha rígida para possível lesão na coluna — marcar D.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRANSPORTE — IMOBILIZAÇÃO',
        rows: [
          { label: 'Coluna', value: 'Prancha rígida + colar + fixação lateral', badge: 'hot' },
          { label: 'Fratura', value: 'Imobilizar suspeita — exposta ou fechada', badge: 'ok' },
          { label: 'Cena', value: 'Segurança do local antes da remoção', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103988389-0': {
    family: 'protocolo',
    guideline:
      'Síndrome compartimental pós-imobilização — dor desproporcional é sinal de alerta precoce; formigamento e fraqueza são tardios',
    roi_error: 'sindrome_compartimental_dor',
    cluster: 'Imobilização — síndrome compartimental pós-gesso',
    danger_footer: 'Gabarito E — dor como sintoma de alerta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Síndrome compartimental — pós-imobilização',
        meta: slideMeta,
        items: [
          { label: 'Compartimento', detail: 'Pressão elevada dentro de fascias musculares após trauma/imobilização.', icon: 'Gauge' },
          { label: 'Dor precoce', detail: 'Desproporcional, piora com estiramento passivo — sinal inicial.', icon: 'AlertTriangle' },
          { label: 'Sinais tardios', detail: 'Formigamento, fraqueza, queimação — isquemia já avançada.', icon: 'Clock' },
          { label: 'Pegadinha — prurido', detail: 'Prurido não caracteriza isquemia compartimental aguda.', icon: 'Ban' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Síndrome compartimental pós-imobilização — sintoma de atenção:',
          'Eliminar prurido — reação cutânea, não compartimental.',
          'Eliminar queimação isolada — pode ser tardia, não o primeiro sinal cobrado.',
          'Eliminar fraqueza — déficit motor tardio.',
          'Eliminar formigamento — parestesia tardia.',
          'Dor desproporcional e persistente — marcar E.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPARTIMENTAL — 5 P\'s',
        rows: [
          { label: 'Pain', value: 'Dor desproporcional — primeiro sinal', badge: 'hot' },
          { label: 'Parestesia', value: 'Formigamento — evolução tardia', badge: 'warn' },
          { label: 'Paralysis', value: 'Fraqueza/paralisia — fase avançada', badge: 'info' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'cpcon-uepb-enfermagem-urgencias-e-emergencias-1777103976379-0': {
    A: 'Valsalva força expiração — não desobstrui corpo estranho em OVACE total.',
    B: 'Leopold é manobra obstétrica — não técnica de desobstrução de VAA.',
    D: 'Torniquete controla hemorragia de membro — não obstrução de via aérea.',
    E: 'Massagem cardíaca é para PCR — obstrução total exige Heimlich enquanto há pulso.',
  },
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-4': {
    A: 'Torniquete é hemostasia — questão cobra reposição volêmica no choque hipovolêmico estabelecido.',
    B: 'Diurético reduz volume — contraindicado na hipovolemia hemorrágica.',
    C: 'Elevar pernas auxilia retorno venoso, mas não repõe volume perdido por hemorragia.',
  },
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-4': {
    A: 'Torniquete é hemostasia — questão cobra reposição volêmica no choque hipovolêmico estabelecido.',
    B: 'Diurético reduz volume — contraindicado na hipovolemia hemorrágica.',
    C: 'Elevar pernas auxilia retorno venoso, mas não repõe volume perdido por hemorragia.',
  },
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-8': {
    A: 'Avaliação secundária só após estabilizar vias aéreas na primária ABC.',
    B: 'Movimentar antes de avaliar aumenta risco de lesão medular secundária.',
    C: 'Consciência não dispensa imobilização — suspeita de trauma exige proteção.',
    E: 'Hemorragias externas devem ser controladas na primária — não ignoradas.',
  },
  'igecap-enfermagem-processo-de-enfermagem-1780007230169-9': {
    A: 'Transportar sem imobilização agrava lesão — técnica inadequada de resgate.',
    B: 'Imobilização também indicada em fraturas fechadas e suspeita de lesão medular.',
    C: 'Remoção segura exige equipe coordenada — não um único socorrista.',
    E: 'Avaliar segurança do ambiente precede qualquer transporte.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103988389-0': {
    A: 'Prurido não é manifestação típica da síndrome compartimental aguda.',
    B: 'Queimação pode aparecer tardiamente — dor precede como alerta precoce.',
    C: 'Fraqueza no membro indica isquemia avançada — não o primeiro sintoma.',
    D: 'Formigamento é parestesia tardia — dor desproporcional vem antes.',
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
    console.log(`[handcraft:urgencias-g18] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g18] total=${ok}`);
}

main();
