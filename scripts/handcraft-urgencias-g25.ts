#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g25 (2 slugs · urgencias_rcp_pediatrico · lote final).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  pedRcpRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpPediatricGolden';

const LOTE = 'urgencias-g25';
const REVIEWER = 'handcraft-urgencias-g25';

const PED_L3_FOOTER = 'RCP pediátrica — compressões de alta qualidade · 100–120/min · retorno total';

const SPECS: Record<string, Pack> = {
  'vunesp-enfermagem-urgencias-e-emergencias-1777104012755-0': {
    family: 'protocolo',
    guideline:
      'Criança sem pulso após engasgo — RCP imediata com compressões fortes, retorno total do tórax e 100–120/min',
    roi_error: 'engasgo_sem_pulso_rcp_pediatrica',
    cluster: 'Escola — OVACE evoluída para PCR pediátrica',
    danger_footer: 'Gabarito B — compressões de alta qualidade',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Engasgo → PCR pediátrica',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Criança 3 anos — corpo estranho no almoço; SAMU acionado; sem pulso.',
            icon: 'School',
          },
          {
            label: 'Sequência',
            detail: 'Manobras de desengasgo primeiro; sem pulso = iniciar RCP imediata.',
            icon: 'ListOrdered',
          },
          {
            label: 'Alta qualidade',
            detail: 'Compressões fortes, retorno total do tórax, ritmo 100–120/min.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — RCP parcial',
            detail: '“RCP parcial” ou ¼ do tórax não é compressão de qualidade pediátrica.',
            icon: 'Ban',
          },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Criança sem pulso após tentativa de desengasgo — conduta enquanto aguarda SAMU:',
          'Eliminar RCP parcial com ¼ do diâmetro — profundidade insuficiente e conduta inexistente.',
          'Eliminar comprimir pulsos — pulso já ausente; não estimula circulação.',
          'Eliminar aguardar orientação médica — PCR exige ação imediata do treinado.',
          'Eliminar priorizar DEA/intubação sem compressões — ciclo começa pelas compressões.',
          'Compressões fortes, retorno total, 100–120/min — marcar B.',
          'Fixação: após engasgo, sem pulso = RCP pediátrica completa, não manobra de desobstrução.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEM PULSO — RCP JÁ',
        rows: pedRcpRows([
          { label: 'Profundidade pediátrica', value: '~⅓ do diâmetro AP — não ¼', badge: 'hot' },
          { label: 'Retorno', value: 'Tórax volta totalmente entre compressões', badge: 'ok' },
        ]),
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-3': {
    family: 'protocolo',
    guideline:
      'RCP extra-hospitalar pediátrica — lactente <1 ano: técnica dos dois dedos abaixo da linha mamilar; frequência 100–120/min',
    roi_error: 'rcp_extra_hospitalar_lactente_dois_dedos',
    cluster: 'RCP extra-hospitalar — técnica por faixa etária pediátrica',
    danger_footer: 'Gabarito C — dois dedos no lactente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP extra-hospitalar pediátrica',
        meta: slideMeta,
        items: [
          {
            label: 'Ambiente extra-hospitalar',
            detail: 'SBV fora do hospital — técnica muda conforme idade da criança.',
            icon: 'MapPin',
          },
          {
            label: 'Lactente <1 ano',
            detail: 'Dois dedos no centro do tórax, logo abaixo da linha mamilar.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha — adulto obeso',
            detail: 'Frequência 120–140 em obeso não é padrão AHA — distrai do lactente.',
            icon: 'AlertTriangle',
          },
          {
            label: 'DEA pediátrico',
            detail: 'Não contraindicar de forma absoluta em crianças — pads pediátricas quando disponíveis.',
            icon: 'Zap',
          },
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'RCP extra-hospitalar — assinale a alternativa correta.',
          'Eliminar A — obeso adulto 120–140/min; padrão é 100–120/min.',
          'Eliminar B — DEA não é proibido absolutamente em crianças <6 anos.',
          'Eliminar D — profundidade de 1–12 anos não é a técnica do lactente <1 ano.',
          'Eliminar E — lactente <1 ano: 100–120/min, não 120–140.',
          'C — dois dedos abaixo da linha mamilar no lactente (salvo recém-nascidos).',
          'Marcar C.',
        ],
        footer_rule: PED_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LACTENTE — DOIS DEDOS',
        rows: pedRcpRows([
          { label: 'Técnica <1 ano', value: 'Dois dedos · centro do tórax · abaixo da linha mamilar', badge: 'hot' },
          { label: 'Extra-hospitalar', value: 'Mesmos parâmetros pediátricos fora do hospital', badge: 'ok' },
        ]),
        footer_rule: PED_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'vunesp-enfermagem-urgencias-e-emergencias-1777104012755-0': {
    A: 'RCP parcial com ¼ do tórax não existe no protocolo — compressão deve ser ~⅓ AP com retorno total.',
    C: 'Comprimir pulsos não gera circulação — sem pulso, iniciar compressões torácicas.',
    D: 'PCR pediátrica não admite esperar médico — técnico treinado inicia RCP imediatamente.',
    E: 'DEA e intubação não substituem compressões contínuas de alta qualidade no início da RCP.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-3': {
    A: 'Adulto obeso segue 100–120/min — não 120–140; gabarito é técnica lactente com dois dedos (C).',
    B: 'DEA não é proibido absolutamente em crianças — usar pads pediátricas; marcar C.',
    D: 'Profundidade em 1–12 anos é outra faixa — não substitui dois dedos no lactente <1 ano.',
    E: 'Lactente <1 ano: frequência 100–120/min — não 120–140; técnica correta é C.',
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
    console.log(`[handcraft:urgencias-g25] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g25] total=${ok}`);
}

main();
