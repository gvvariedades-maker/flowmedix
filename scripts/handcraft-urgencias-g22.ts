#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g22 (8 slugs · urgencias_engasgo · lote 1).
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

const LOTE = 'urgencias-g22';
const REVIEWER = 'handcraft-urgencias-g22';

const ENGASGO_L3_FOOTER =
  'Engasgo e OVACE — sinal universal no pescoço, Heimlich no adulto consciente';

const SPECS: Record<string, Pack> = {
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-6': {
    family: 'protocolo',
    guideline: 'Sinal universal de engasgo — mãos ao pescoço (MS/SBV)',
    roi_error: 'sinal_universal_pescoco',
    cluster: 'Engasgo — sinal universal (gesto de reconhecimento)',
    danger_footer: 'Gabarito E — pescoço',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinal universal de engasgo',
        meta: slideMeta,
        items: [
          { label: 'Sinal universal', detail: 'Vítima consciente com obstrução leva as mãos ao pescoço.', icon: 'AlertTriangle' },
          { label: 'Reconhecimento', detail: 'Gesto de sufocamento — pede ajuda sem conseguir falar.', icon: 'Target' },
          { label: 'Conduta depois', detail: 'Adulto consciente: manobra de Heimlich até expulsão.', icon: 'Hand' },
          { label: 'Pegadinha — abdome', detail: 'Abdome é local da manobra, não do sinal universal.', icon: 'XCircle' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinal universal de engasgo — onde a vítima leva as mãos:',
          'Eliminar calcâneo e joelho — membros inferiores sem relação com sufocamento.',
          'Eliminar abdome — local da compressão Heimlich, não do gesto.',
          'Eliminar deltoide — membro superior sem gesto de obstrução.',
          'Pescoço — marcar E.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINAL × MANOBRA',
        rows: ovaceRows(),
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SINAL UNIVERSAL',
        items: [
          {
            label: 'Letra C — abdome',
            detail: 'Parece certo porque a manobra de Heimlich comprime o abdome.',
            correct: 'Abdome é local da manobra — o sinal de reconhecimento é pescoço.',
          },
          {
            label: 'Letra A — calcâneo',
            detail: 'Região do pé sem relação com obstrução de via aérea.',
            correct: 'Sinal universal é cervical: mãos no pescoço.',
          },
          {
            label: 'Letra B — joelho',
            detail: 'Membro inferior distante do gesto de sufocamento.',
            correct: 'Joelho não traduz engasgo — gesto é mãos à garganta.',
          },
          {
            label: 'Letra D — deltoide',
            detail: 'Confunde membro superior com gesto clássico.',
            correct: 'Deltoide não é sinal universal — pescoço é o gesto cobrado.',
          },
        ],
        footer_rule: 'Banca troca sinal (pescoço) por local da manobra (abdome)',
      },
    ],
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-7': {
    family: 'protocolo',
    guideline: 'Sinal universal — mãos no pescoço em obstrução de via aérea consciente',
    roi_error: 'sinal_universal_maos_pescoco',
    cluster: 'Engasgo — identificar sinal universal',
    danger_footer: 'Gabarito A — mãos no pescoço',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Engasgo — sinal universal',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Gesto espontâneo da vítima consciente com OVACE.', icon: 'Wind' },
          { label: 'Mãos no pescoço', detail: 'Alternativa literal do protocolo de engasgo.', icon: 'Hand' },
          { label: 'Pegadinha — punho no peito', detail: 'Dor torácica usa punho no peito — não é engasgo.', icon: 'Ban' },
          { label: 'Pegadinha — vômito', detail: 'Vômito em jato é outro mecanismo — não sinal universal.', icon: 'AlertTriangle' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Assinale o sinal universal de engasgo:',
          'Eliminar sede intermitente — não é gesto de obstrução.',
          'Eliminar vômito em jato — eliminação gástrica, não OVACE.',
          'Eliminar mão no peito em punho — sinal de dor torácica.',
          'Mãos no pescoço — marcar A.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINAL UNIVERSAL',
        rows: [
          { label: 'Gesto', value: 'Mãos ao pescoço / garganta', badge: 'hot' },
          { label: '≠ punho no peito', value: 'Sinal de dor torácica — não engasgo', badge: 'warn' },
          { label: 'Depois', value: 'Heimlich se consciente e obstrução grave', badge: 'ok' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'fepese-enfermagem-urgencias-e-emergencias-1777103988389-9': {
    family: 'protocolo',
    guideline: 'Desobstrução VA — compressão abdominal de baixo para cima = manobra de Heimlich',
    roi_error: 'heimlich_compressao_abdominal',
    cluster: 'OVACE — manobra de Heimlich',
    danger_footer: 'Gabarito C — manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Heimlich — desobstrução',
        meta: slideMeta,
        items: [
          { label: 'Técnica', detail: 'Pressionar abdômen de baixo para cima — expulsar corpo estranho.', icon: 'Hand' },
          { label: 'Heimlich', detail: 'Nome mundial da compressão abdominal em engasgo.', icon: 'Target' },
          { label: 'OVACE', detail: 'Obstrução de via aérea por corpo estranho consciente.', icon: 'Wind' },
          { label: 'Pegadinha — RCP', detail: 'Massagem cardíaca é para PCR, não obstrução com pulso.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Compressão abdominal para expulsar objeto — nome da manobra:',
          'Eliminar taponamento — hemostasia nasal, não engasgo.',
          'Eliminar massagem cardíaca — indicada em parada cardíaca.',
          'Eliminar boca a boca isolado — ventilação, não desobstrução mecânica.',
          'Eliminar RCP completa — sequência de parada, não OVACE consciente.',
          'Manobra de Heimlich — marcar C.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HEIMLICH — DECORE',
        rows: ovaceRows([{ label: 'Nome', value: 'Compressão abdominal = Heimlich', badge: 'hot' }]),
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-8': {
    family: 'protocolo',
    guideline: 'Engasgo grave em responsivo — manobra de Heimlich até desobstruir ou evoluir inconsciência',
    roi_error: 'engasgo_grave_heimlich_responsivo',
    cluster: 'OVACE grave — adulto responsivo',
    danger_footer: 'Gabarito D — manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'OVACE grave — responsivo',
        meta: slideMeta,
        items: [
          { label: 'Quadro', detail: 'Não fala, tosse silenciosa, respiração ruidosa — obstrução grave.', icon: 'AlertTriangle' },
          { label: 'Responsivo', detail: 'Ainda consciente — manobra de Heimlich, não PLS isolado.', icon: 'User' },
          { label: 'Heimlich', detail: 'Compressões abdominais até expulsar ou perder consciência.', icon: 'Hand' },
          { label: 'Pegadinha — prona', detail: 'Decúbito prono não desobstrui via aérea em OVACE.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Engasgo grave — paciente responsivo — manobra indicada:',
          'Eliminar movimento em J — posicionamento lateral, não desobstrução.',
          'Eliminar PLS — posição de recuperação após estabilizar, não 1ª manobra OVACE.',
          'Eliminar manobra prona — não remove corpo estranho.',
          'Eliminar Sims — facilita drenagem, não desobstrução aguda.',
          'Manobra de Heimlich — marcar D.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GRAVE × CONSCIENTE',
        rows: [
          { label: 'Consciente', value: 'Heimlich até expulsão', badge: 'hot' },
          { label: 'Inconsciente', value: 'Suporte básico de vida — checar boca', badge: 'warn' },
          { label: '≠ PLS', value: 'Recuperação lateral vem depois', badge: 'info' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'ibfc-enfermagem-urgencias-e-emergencias-1777103988389-3': {
    family: 'conceito',
    guideline: 'Engasgo — manobra de Heimlich é a desobstrução abdominal universalmente conhecida',
    roi_error: 'heimlich_nome_mundial',
    cluster: 'Engasgo — nomenclatura da manobra',
    danger_footer: 'Gabarito A — manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Engasgo — manobra clássica',
        meta: slideMeta,
        items: [
          { label: 'Engasgo', detail: 'Bloqueio da traqueia por alimento ou corpo estranho.', icon: 'Wind' },
          { label: 'Heimlich', detail: 'Manobra abdominal mundialmente ensinada na OVACE.', icon: 'Hand' },
          { label: 'Pegadinha — Valsalva', detail: 'Manobra expiratória — não desobstrui traqueia.', icon: 'Ban' },
          { label: 'Pegadinha — Leopold', detail: 'Manobra obstétrica — fora do contexto de engasgo.', icon: 'AlertTriangle' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manobra mais conhecida mundialmente no engasgo:',
          'Eliminar Valsalva — força expiratória contra glote fechada.',
          'Eliminar Kristeller — manobra obstétrica proscrita.',
          'Eliminar Leopold — palpação obstétrica fetal.',
          'Manobra de Heimlich — marcar A.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NOMES — NÃO CONFUNDIR',
        rows: [
          { label: 'Heimlich', value: 'Compressão abdominal — engasgo', badge: 'hot' },
          { label: 'Valsalva', value: 'Expiração forçada — não OVACE', badge: 'warn' },
          { label: 'Leopold', value: 'Obstetrícia — não urgência VA', badge: 'info' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006969552-0': {
    family: 'protocolo',
    guideline: 'OVACE grave em criança — 5 golpes nas costas alternados com 5 compressões abdominais',
    roi_error: 'ovace_crianca_golpes_costas',
    cluster: 'OVACE pediátrica — criança consciente grave',
    danger_footer: 'Gabarito D — 5 costas + 5 abdominais',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'OVACE — criança grave',
        meta: slideMeta,
        items: [
          { label: 'Sinais', detail: 'Não fala, não tosse eficaz, não respira bem — OVACE grave.', icon: 'AlertTriangle' },
          { label: 'Criança', detail: 'Não usar só Heimlich adulto — sequência pediátrica.', icon: 'Baby' },
          { label: 'Sequência', detail: '5 golpes interescapulares + 5 compressões abdominais.', icon: 'ListOrdered' },
          { label: 'Pegadinha — só abdome', detail: 'Bebê não recebe compressão abdominal isolada como 1ª linha.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'OVACE grave em criança — alternativa correta:',
          'Eliminar A — compressões abdominais exclusivas (protocolo pediátrico alterna).',
          'Eliminar B — torácicas antes de costas (ordem invertida).',
          'Eliminar C — abdome em bebê como 1ª manobra isolada.',
          '5 golpes nas costas alternados com 5 compressões abdominais — marcar D.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PEDIÁTRICO — OVACE',
        rows: ovaceRows([
          { label: 'Bebê', value: '5 costas + 5 torácicas — não Heimlich abdominal isolado', badge: 'hot' },
        ]),
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-2': {
    family: 'protocolo',
    guideline: 'OVACE consciente grave — manobra de Heimlich imediata (não RCP nem boca a boca primeiro)',
    roi_error: 'ovace_consciente_heimlich',
    cluster: 'OVACE — adulto consciente obstrução grave',
    danger_footer: 'Gabarito C — manobra de Heimlich',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'OVACE — consciente grave',
        meta: slideMeta,
        items: [
          { label: 'Testemunhado', detail: 'Sufocação com obstrução grave — ação imediata.', icon: 'AlertTriangle' },
          { label: 'Consciente', detail: 'Não consegue falar — ainda com pulso e resposta.', icon: 'User' },
          { label: 'Heimlich', detail: 'Desobstrução mecânica antes de ventilar ou comprimir tórax.', icon: 'Hand' },
          { label: 'Pegadinha — RCP', detail: 'Massagem cardíaca só após inconsciência e parada.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'OVACE grave — paciente consciente — 1ª ação:',
          'Eliminar aferir sinais vitais como única conduta — desobstruir primeiro.',
          'Eliminar massagem cardíaca — sem parada cardíaca estabelecida.',
          'Eliminar ventilação boca a boca isolada — não empurra corpo estranho.',
          'Manobra de Heimlich — marcar C.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'OVACE CONSCIENTE',
        rows: ovaceRows(),
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-6': {
    family: 'protocolo',
    guideline:
      'Corpo estranho impactado — fixar objeto para transporte; não retirar no local (paralelo OVACE: não extrair às cegas)',
    roi_error: 'corpo_estranho_impactado_fixar',
    cluster: 'OVACE — corpo estranho retido (objeto transfixante)',
    danger_footer: 'Gabarito D — fixar corpo estranho',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Corpo estranho — objeto retido',
        meta: slideMeta,
        items: [
          { label: 'OVACE ampliado', detail: 'Corpo estranho retido — regra: não extrair no pré-hospitalar.', icon: 'Package' },
          { label: 'Engasgo / impacto', detail: 'Objeto transfixante funciona como corpo estranho fixo.', icon: 'AlertTriangle' },
          { label: 'Fixar', detail: 'Estabilizar vergalhão com curativos/ataduras — evitar movimento.', icon: 'Shield' },
          { label: 'Pegadinha — remover', detail: 'Retirar no local aumenta hemorragia e lesão interna.', icon: 'Ban' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Vergalhão transfixante abdominal — procedimento no socorro:',
          'Eliminar O₂ só se solicitado — prioridade é estabilizar objeto.',
          'Eliminar remover vergalhão — contraindicado no local.',
          'Eliminar palpação exploratória — agrava lesão.',
          'Fixar e imobilizar corpo estranho para transporte — marcar D.',
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CORPO ESTRANHO — REGRA',
        rows: [
          { label: 'Não fazer', value: 'Retirar objeto impactado no local', badge: 'hot' },
          { label: 'Fazer', value: 'Fixar com material ao redor — transporte seguro', badge: 'ok' },
          { label: 'OVACE', value: 'Mesma lógica: não empurrar corpo estranho às cegas', badge: 'warn' },
        ],
        footer_rule: ENGASGO_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780009366805-7': {
    B: 'Sede não é gesto de obstrução de via aérea.',
    C: 'Vômito em jato não caracteriza sinal universal de engasgo.',
    D: 'Punho no peito sugere dor torácica — não OVACE.',
    E: 'Punho aberto no peito também aponta para dor torácica, não engasgo.',
  },
  'fepese-enfermagem-urgencias-e-emergencias-1777103988389-9': {
    A: 'Taponamento é hemostasia nasal — não desobstrução de via aérea.',
    B: 'Massagem cardíaca é para parada cardíaca, não OVACE consciente.',
    D: 'Boca a boca ventila — não expulsa corpo estranho mecanicamente.',
    E: 'RCP completa indica parada — engasgo consciente exige Heimlich.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006947080-8': {
    A: 'Movimento em J é posicionamento lateral — não manobra de desobstrução.',
    B: 'PLS vem após estabilização — não é 1ª escolha na OVACE grave consciente.',
    C: 'Decúbito prono não remove corpo estranho da traqueia.',
    E: 'Sims facilita drenagem de vômito — não desobstrui engasgo agudo.',
  },
  'ibfc-enfermagem-urgencias-e-emergencias-1777103988389-3': {
    B: 'Valsalva força expiração — não desobstrui traqueia.',
    C: 'Kristeller é manobra obstétrica proibida — não engasgo.',
    D: 'Leopold é palpação fetal — fora do tema OVACE.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006969552-0': {
    A: 'Compressão abdominal exclusiva não é protocolo pediátrico atual.',
    B: 'Ordem invertida — costas precedem ou alternam com abdome.',
    C: 'Bebê recebe torácicas, não abdome isolado como 1ª linha.',
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-2': {
    A: 'Aferir sinais vitais não desobstrui — Heimlich é prioridade.',
    B: 'Massagem cardíaca sem parada cardíaca estabelecida.',
    D: 'Ventilação boca a boca não substitui manobra de Heimlich.',
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-6': {
    A: 'Oxigênio sob demanda não estabiliza objeto transfixante.',
    B: 'Remover vergalhão no local agrava lesão — contraindicado.',
    C: 'Palpação abdominal exploratória piora sangramento interno.',
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
    console.log(`[handcraft:urgencias-g22] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g22] total=${ok}`);
}

main();
