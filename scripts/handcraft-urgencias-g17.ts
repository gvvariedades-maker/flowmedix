#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g17 (8 slugs · urgencias_xabcde_trauma · lote 2).
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

const LOTE = 'urgencias-g17';
const REVIEWER = 'handcraft-urgencias-g17';

/** Ancora inferência L3 ≥2 URGENCIAS_TRAUMA sem disparar engasgo/RCP */
const TRAUMA_L3_FOOTER =
  'XABCDE trauma — hemorragia e imobilização; queimadura térmica e esmagamento BT16 em módulos à parte';

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780002934000-5': {
    family: 'protocolo',
    guideline: 'Queimadura térmica APH — resfriar com água corrente ambiente; evitar substâncias caseiras',
    roi_error: 'queimadura_aph_resfriamento',
    cluster: 'Trauma APH — queimadura térmica no atendimento inicial',
    danger_footer: 'Gabarito C — resfriar queimadura com água corrente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'APH trauma — queimadura térmica',
        meta: slideMeta,
        items: [
          { label: 'APH trauma', detail: 'Estabilizar até suporte avançado — conduta imediata e segura.', icon: 'Activity' },
          { label: 'Queimadura extensa', detail: 'Resfriar com água corrente em temperatura ambiente.', icon: 'Droplets' },
          { label: 'Pegadinha — torniquete pescoço', detail: 'Torniquete cervical não controla hemorragia de membro — técnica errada.', icon: 'Ban' },
          { label: 'Pegadinha — tração fêmur', detail: 'Não tracionar vigorosamente fratura antes de imobilizar.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atendimento inicial ao trauma — alternativa correta:',
          'Eliminar torniquete no pescoço para hemorragia de membro.',
          'Eliminar tração vigorosa de fêmur antes de imobilização.',
          'Eliminar retirada de objeto penetrante abdominal no local.',
          'Queimadura térmica extensa — resfriar com água corrente ambiente, sem pasta/manteiga — marcar C.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'QUEIMADURA — APH',
        rows: [
          { label: '1º', value: 'Resfriar com água corrente ambiente', badge: 'hot' },
          { label: 'Evitar', value: 'Pasta, manteiga, gelo direto', badge: 'warn' },
          { label: '≠ hemorragia', value: 'Compressão direta ou torniquete proximal em membro', badge: 'ok' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'facet-geral-urgencias-e-emergencias-1777103976379-4': {
    family: 'protocolo',
    guideline: 'ABCDE trauma — A (Airway): verificar e liberar VAA; elevação do queixo se inconsciente sem suspeita cervical isolada',
    roi_error: 'abcde_a_via_aerea',
    cluster: 'ABCDE — letra A permeabilidade',
    danger_footer: 'Gabarito D — verificar e liberar vias aéreas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ABCDE trauma — letra A',
        meta: slideMeta,
        items: [
          { label: 'Airway', detail: 'Primeira ameaça — garantir permeabilidade das vias aéreas.', icon: 'Wind' },
          { label: 'Inconsciente', detail: 'Verificar secreções · liberar com manobra adequada.', icon: 'User' },
          { label: 'Pegadinha — O₂ isolado', detail: 'Máscara de O₂ não substitui abertura de vias aéreas não pérvias.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — fluido IV', detail: 'Circulação (C) — não medida prioritária de A.', icon: 'Syringe' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'ABCDE trauma — medida prioritária da letra A (inconsciente):',
          'Eliminar bandagem no tórax (B/C).',
          'Eliminar monitoramento contínuo como única ação de A.',
          'Eliminar máscara de O₂ sem perviedade prévia.',
          'Eliminar fluidos IV (etapa C).',
          'Verificar e, se necessário, liberar vias aéreas com elevação do queixo — marcar D.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ABCDE — A',
        rows: [
          { label: 'A', value: 'Airway — via aérea pérvia', badge: 'hot' },
          { label: 'Manobra', value: 'Elevação queixo / jaw-thrust conforme trauma cervical', badge: 'ok' },
          { label: '≠ B', value: 'Ventilação efetiva vem após A', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104056718-6': {
    family: 'vf',
    guideline: 'ABCDE trauma V/F — coluna cervical antes da avaliação (V) · TEC normal ≤2s (F se ≥2s) · jaw thrust inconsciente (V)',
    roi_error: 'abcde_trauma_vf_coluna_jaw',
    cluster: 'ABCDE trauma — V/F coluna · TEC · jaw thrust',
    danger_footer: 'Gabarito C — V – F – V',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ABCDE trauma — V/F protocolo',
        meta: slideMeta,
        items: [
          { label: 'I — coluna', detail: 'Estabilizar coluna cervical com suspeita de trauma antes da avaliação — verdadeira.', icon: 'Bone' },
          { label: 'II — TEC', detail: 'Enchimento capilar normal ≤2s — afirmativa “≥2s” inverte o critério — falsa.', icon: 'Clock' },
          { label: 'III — jaw thrust', detail: 'Tração mandibular anterioriza hioide e língua em inconsciente — verdadeira.', icon: 'Wind' },
          { label: 'Pegadinha — TEC', detail: 'Prolongado (>2s) indica perfusão ruim — não “igual ou maior que 2”.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'ABCDE trauma — analisar I, II e III:',
          'I — estabilizar coluna cervical antes da avaliação: verdadeira.',
          'II — TEC “igual ou maior que 2 segundos” como normal: falsa — normal é ≤2s.',
          'III — jaw thrust em inconsciente: verdadeira.',
          'Combinação V – F – V — marcar C.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ABCDE TRAUMA — DECORE VF',
        rows: [
          { label: 'Coluna', value: 'Estabilização manual antes/durante avaliação', badge: 'hot' },
          { label: 'TEC', value: '≤2 segundos = normal', badge: 'ok' },
          { label: 'Jaw thrust', value: 'VAA em trauma — evita hiperextensão', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-2': {
    family: 'protocolo',
    guideline: 'Trauma cervical — imobilização manual da coluna + jaw thrust + avaliar respiração; evitar head-tilt e tração',
    roi_error: 'trauma_cervical_jaw_thrust',
    cluster: 'Trauma cervical — jaw thrust e imobilização',
    danger_footer: 'Gabarito E — imobilização manual + jaw thrust',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trauma cervical — conduta APH',
        meta: slideMeta,
        items: [
          { label: 'Suspeita cervical', detail: 'Inconsciente + trauma — proteger medula desde o 1º contato.', icon: 'Bone' },
          { label: 'Imobilização manual', detail: 'Estabilização contínua da cabeça/colo até dispositivo.', icon: 'Hand' },
          { label: 'Jaw thrust', detail: 'Abrir VAA sem hiperextender pescoço.', icon: 'Wind' },
          { label: 'Pegadinha — parada precoce', detail: 'Reanimação sem checar responsividade ignora VAA e coluna.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma coluna cervical — conduta prioritária:',
          'Eliminar tração cervical vigorosa para ventilar.',
          'Eliminar aguardar sem manipular mínima necessária.',
          'Eliminar reanimação imediata sem avaliar responsividade.',
          'Eliminar retirar colar para intubar precocemente.',
          'Imobilização manual + jaw thrust + avaliar respiração — marcar E.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAUMA CERVICAL — APH',
        rows: [
          { label: '1º', value: 'Imobilização manual da coluna', badge: 'hot' },
          { label: 'VAA', value: 'Jaw thrust — não head-tilt', badge: 'ok' },
          { label: 'Seguinte', value: 'Avaliar respiração e circulação', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — trauma cervical jaw thrust',
        items: [
          {
            label: 'Alt. A — tração cervical vigorosa',
            detail: 'Tração forçada para ventilar agrava lesão medular.',
            correct: 'Manter imobilização manual e abrir vias aéreas com jaw thrust — gabarito E.',
          },
          {
            label: 'Alt. B — aguardar equipe sem estabilizar',
            detail: 'Inação prolongada abandona vias aéreas e coluna.',
            correct: 'Estabilização manual + jaw thrust são condutas imediatas — gabarito E.',
          },
          {
            label: 'Alt. C — reanimação imediata sem checar',
            detail: 'Iniciar manobras cardíacas sem avaliar ignora prioridade APH trauma.',
            correct: 'Primeiro imobilizar coluna e garantir vias aéreas — gabarito E.',
          },
          {
            label: 'Alt. D — retirar colar para intubar',
            detail: 'Remover proteção cervical precocemente aumenta risco medular.',
            correct: 'Manter imobilização até equipe adequada — gabarito E.',
          },
        ],
        footer_rule: 'Gabarito E — imobilização manual + jaw thrust',
      },
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-3': {
    family: 'protocolo',
    guideline: 'Politrauma XABCDE — hemorragia profusa: compressão direta na fonte antes de fluido, intubação ou vasopressor',
    roi_error: 'politrauma_hemorragia_compressao',
    cluster: 'Politrauma — prioridade hemostática X/C',
    danger_footer: 'Gabarito B — compressão direta + monitorizar perfusão',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Politrauma — sangramento profuso',
        meta: slideMeta,
        items: [
          { label: 'XABCDE', detail: 'Hemorragia exsanguinante precede reposição volêmica isolada.', icon: 'Droplet' },
          { label: 'Compressão direta', detail: 'Controle imediato na fonte do sangramento.', icon: 'Hand' },
          { label: 'Perfusão', detail: 'Monitorizar enchimento capilar e estado mental.', icon: 'HeartPulse' },
          { label: 'Pegadinha — fluido antes', detail: 'Cristaloide sem hemostasia não estanca exsanguinação.', icon: 'AlertTriangle' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Politrauma + sangramento profuso + choque hipovolêmico — prioridade:',
          'Eliminar fluido IV postergando contenção hemorrágica.',
          'Eliminar imobilizar fraturas e radiografia antes de hemostasia externa.',
          'Eliminar intubação imediata independente de respiração.',
          'Eliminar vasopressor sem controle prévio do sangramento.',
          'Compressão direta na fonte + monitorizar perfusão — marcar B.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POLITRAUMA — HEMORRAGIA',
        rows: [
          { label: 'X/C', value: 'Controlar hemorragia externa primeiro', badge: 'hot' },
          { label: 'Técnica', value: 'Compressão direta · torniquete se indicado', badge: 'ok' },
          { label: 'Depois', value: 'Acesso venoso e reposição conforme protocolo', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-5': {
    family: 'protocolo',
    guideline: 'Trauma extremidades SBV — segurança do paciente e da cena antes de curativo, imobilização ou palpação',
    roi_error: 'trauma_extremidade_seguranca_cena',
    cluster: 'Trauma extremidades — segurança cena SBV',
    danger_footer: 'Gabarito D — segurança paciente e cena',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trauma extremidades — segurança',
        meta: slideMeta,
        items: [
          { label: 'Sinais fratura', detail: 'Dor · deformidade · crepitação · alteração neurovascular.', icon: 'Bone' },
          { label: 'Segurança cena', detail: 'Proteger socorrista e equipe antes de abordar vítima.', icon: 'Shield' },
          { label: 'Pegadinha — curativo não estéril', detail: 'Ferimento aberto exige técnica asséptica — não dispensar esterilidade.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — carótida', detail: 'Pulso periférico da extremidade — não carótida para perfusão distal.', icon: 'Activity' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma de extremidades — primeiros socorros — necessário:',
          'Eliminar curativo sem material estéril.',
          'Eliminar imobilizar como única prioridade sem segurança.',
          'Eliminar palpar carótida para perfusão de extremidade.',
          'Priorizar segurança do paciente e observar segurança do local/equipe — marcar D.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAUMA — ORDEM APH',
        rows: [
          { label: '1º', value: 'Segurança da cena e EPI', badge: 'hot' },
          { label: '2º', value: 'Segurança do paciente', badge: 'ok' },
          { label: '3º', value: 'Imobilização · curativo · avaliação neurovascular', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-5': {
    family: 'protocolo',
    guideline: 'SAMU — colar cervical reduz lesão medular no transporte; complementa prancha e imobilização em bloco',
    roi_error: 'samu_colar_cervical_imobilizacao',
    cluster: 'Imobilização SAMU — colar cervical',
    danger_footer: 'Gabarito C — colar cervical',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SAMU — imobilização medular',
        meta: slideMeta,
        items: [
          { label: 'Lesão medular', detail: 'Transporte seguro exige restrição cervical.', icon: 'Bone' },
          { label: 'Colar cervical', detail: 'Dispositivo padrão para imobilização cervical no APH.', icon: 'Shield' },
          { label: 'Pegadinha — lift/cinto', detail: 'Equipamentos de transferência — não substituem colar cervical.', icon: 'AlertTriangle' },
          { label: 'Prancha', detail: 'Complementar — colar isolado não basta, mas é o item cobrado.', icon: 'Package' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'SAMU — equipamento para imobilização/transporte adulto (lesão medular):',
          'Eliminar lift (transferência vertical).',
          'Eliminar prancha deslizante como resposta isolada cobrada.',
          'Eliminar slide up wide (transferência).',
          'Eliminar cinto de transferência.',
          'Colar cervical — marcar C.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMOBILIZAÇÃO SAMU',
        rows: [
          { label: 'Colar', value: 'Restrição cervical — resposta da prova', badge: 'hot' },
          { label: 'Prancha', value: 'Transporte com restrição global', badge: 'ok' },
          { label: 'Manual', value: 'Estabilização até dispositivos', badge: 'warn' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-5': {
    family: 'protocolo',
    guideline: 'X-ABCDE PHTLS — X = hemorragia exsanguinante com risco iminente de morte; controle imediato na avaliação primária',
    roi_error: 'xabcde_x_exsanguinante',
    cluster: 'X-ABCDE PHTLS — significado da letra X',
    danger_footer: 'Gabarito B — hemorragia exsanguinante imediata',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'X-ABCDE — letra X (PHTLS)',
        meta: slideMeta,
        items: [
          { label: 'X — exsanguinação', detail: 'Sangramento com risco iminente de morte — tratar primeiro.', icon: 'Droplet' },
          { label: 'Gerenciamento imediato', detail: 'Identificar e controlar na avaliação primária.', icon: 'Hand' },
          { label: 'Pegadinha — C substitui X', detail: 'Circulação (C) não redefine X — hemorragia massiva antecede.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — capilar = X', detail: 'Sangramento capilar não é exsanguinante prioritário.', icon: 'Ban' },
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'XABCDE (PHTLS) — o X significa que:',
          'Eliminar ausência de ordem entre A/B/C/D.',
          'Eliminar hemorragia grave como prioridade só do item C.',
          'Eliminar Glasgow como 1ª abordagem na hemorragia.',
          'Eliminar capilar/venoso/arterial todos como exsanguinante.',
          'Há necessidade de identificar e gerenciar hemorragia exsanguinante imediata — marcar B.',
        ],
        footer_rule: TRAUMA_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'XABCDE — DECORE',
        rows: xabcdeRows(),
        footer_rule: TRAUMA_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780002934000-5': {
    A: 'Torniquete no pescoço para hemorragia de membro é conduta incorreta e perigosa.',
    B: 'Tração vigorosa de fêmur agrava lesão — imobilizar sem realinhar à força.',
    D: 'Retirar objeto penetrante abdominal no local aumenta hemorragia — não é conduta APH correta.',
  },
  'facet-geral-urgencias-e-emergencias-1777103976379-4': {
    A: 'Bandagem compressiva no tórax não garante permeabilidade das vias aéreas — é etapa B/C.',
    B: 'Monitoramento contínuo acompanha — não é a medida prioritária de Airway.',
    C: 'Máscara de O₂ supõe VAA pérvia — A exige verificar e liberar primeiro.',
    E: 'Fluidos IV pertencem à circulação (C) — não descrevem a etapa A.',
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104056718-6': {
    A: 'II verdadeira (TEC ≥2s) erra — enchimento capilar normal é ≤2 segundos.',
    B: 'Nenhuma afirmativa correta — coluna e jaw thrust são verdadeiras.',
    D: 'II falsa invertida — TEC prolongado indica hipoperfusão, não normalidade.',
    E: 'II também falsa — TEC “≥2s” como normal contradiz protocolo trauma.',
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-3': {
    A: 'Reposição volêmica postergando hemostasia não controla exsanguinação ativa.',
    C: 'Radiografia e imobilização de fratura antes de sangramento externo invertem prioridade XABCDE.',
    D: 'Intubação imediata sem indicação respiratória ignora hemorragia profusa visível.',
    E: 'Vasopressor sem controle de sangramento não trata causa do choque hipovolêmico.',
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-5': {
    A: 'Curativo em ferimento aberto exige material estéril — dispensar esterilidade está errado.',
    B: 'Imobilização é necessária — mas após garantir segurança da cena e do paciente.',
    C: 'Carótida não avalia perfusão da extremidade traumatizada — usar pulso periférico distal.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-5': {
    A: 'Lift é equipamento de transferência — não o dispositivo de imobilização cervical cobrado.',
    B: 'Prancha deslizante auxilia movimentação — a banca cobra colar cervical especificamente.',
    D: 'Slide up wide é transferência — não responde imobilização medular direta.',
    E: 'Cinto de transferência não substitui restrição cervical no transporte trauma.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104070286-5': {
    A: 'X não elimina ordem ABCDE — acrescenta hemorragia exsanguinante antes das etapas.',
    C: 'Hemorragia grave integra X — não “passa” a ser só prioridade do item C isolado.',
    D: 'Glasgow pertence ao D (Disability) — não inicia abordagem na hemorragia exsanguinante.',
    E: 'Sangramento capilar não configura hemorragia exsanguinante com risco iminente de morte.',
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
    console.log(`[handcraft:urgencias-g17] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g17] total=${ok}`);
}

main();
