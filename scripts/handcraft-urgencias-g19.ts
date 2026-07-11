#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g19 (8 slugs · urgencias_choque · lote 1).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  choqueTypesRows,
  finalizeSlides,
  metaBase,
  perfusaoRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasChoqueGolden';

const LOTE = 'urgencias-g19';
const REVIEWER = 'handcraft-urgencias-g19';

const CHOQUE_L3_FOOTER =
  'Choque e hipoperfusão — tipos, sinais periféricos e segurança da cena elétrica';

const SPECS: Record<string, Pack> = {
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-4': {
    family: 'protocolo',
    guideline: 'Choque elétrico — interromper corrente antes de tocar na vítima (MS/SBV)',
    roi_error: 'choque_eletrico_seguranca_cena',
    cluster: 'Choque elétrico — primeira conduta (interromper corrente)',
    danger_footer: 'Gabarito D — não tocar antes de desenergizar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque elétrico — 1ª conduta',
        meta: slideMeta,
        items: [
          { label: 'Choque elétrico', detail: 'Acidente com corrente — arritmia e queimaduras possíveis.', icon: 'Zap' },
          { label: 'Segurança', detail: 'Vítima pode permanecer energizada — socorrista não vira segunda vítima.', icon: 'Shield' },
          { label: 'Interromper fonte', detail: 'Desligar chave ou afastar da corrente antes do toque.', icon: 'Power' },
          { label: 'Pegadinha — RCP cedo', detail: 'Reanimação só após cena segura e checagem de consciência.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque elétrico — primeira conduta em primeiros socorros:',
          'Eliminar afrouxar roupas como 1ª ação — vem depois da segurança.',
          'Eliminar massagem cardíaca imediata — só após desenergizar e avaliar.',
          'Eliminar enrolar em pano — não interrompe a eletricidade.',
          'Não tocar na vítima antes de certificar circuito interrompido — marcar D.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ELÉTRICO — SEQUÊNCIA',
        rows: [
          { label: '1º', value: 'Não tocar · desligar fonte de energia', badge: 'hot' },
          { label: '2º', value: 'Checar consciência e respiração', badge: 'ok' },
          { label: '3º', value: 'Suporte básico de vida se necessário', badge: 'info' },
          { label: '≠ hipovolêmico', value: 'Choque circulatório = hipoperfusão — outro mecanismo', badge: 'warn' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CHOQUE ELÉTRICO',
        items: [
          {
            label: 'Letra A — afrouxar roupas',
            detail: 'Parece cuidado com ventilação logo no início.',
            correct: 'Só depois da cena segura; a 1ª conduta é interromper a corrente elétrica.',
          },
          {
            label: 'Pegadinha — RCP cedo',
            detail: 'Sem respiração assusta — candidato corre para massagem cardíaca.',
            correct: 'RCP é após desenergizar; tocar na vítima energizada eletrocuta o socorrista.',
          },
          {
            label: 'Letra C — enrolar em pano',
            detail: 'Parece proteger e buscar ajuda ao mesmo tempo.',
            correct: 'Não interrompe a eletricidade nem substitui desligar o circuito.',
          },
        ],
        footer_rule: 'Choque elétrico ≠ choque circulatório',
      },
    ],
  },
  'cpcon-uepb-geral-urgencias-e-emergencias-1777103970505-0': {
    family: 'protocolo',
    guideline: 'Acidente elétrico ocupacional — separar vítima da corrente antes de qualquer toque',
    roi_error: 'choque_eletrico_nebulizador',
    cluster: 'Choque elétrico — fio desencapado / segurança coletiva',
    danger_footer: 'Gabarito E — não tocar até separar da corrente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Choque elétrico — ambiente de trabalho',
        meta: slideMeta,
        items: [
          { label: 'Cena', detail: 'Colega energizado ao ligar equipamento com fio desencapado.', icon: 'Zap' },
          { label: 'Risco coletivo', detail: 'Quem toca sem desenergizar também recebe choque elétrico.', icon: 'Users' },
          { label: 'Prioridade', detail: 'Interromper corrente ou isolar vítima com material adequado.', icon: 'Shield' },
          { label: 'Pegadinha — puxar fio', detail: 'Puxar plugue com mãos molhadas mantém risco de condução.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque elétrico no trabalho — conduta para manter todos em segurança:',
          'Eliminar examinar queimaduras antes de desenergizar — ordem invertida.',
          'Eliminar puxar fio da tomada com as mãos — risco de condução.',
          'Eliminar socorrer antes de cortar corrente — sequência perigosa.',
          'Eliminar puxar vítima pelas mãos — transmite corrente ao socorrista.',
          'Não tocar até vítima separada da corrente ou energia interrompida — marcar E.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ELÉTRICO — SEGURANÇA',
        rows: [
          { label: 'Nunca', value: 'Tocar vítima energizada ou puxar pelo corpo', badge: 'hot' },
          { label: 'Sempre', value: 'Desligar chave geral ou usar isolante', badge: 'ok' },
          { label: 'Depois', value: 'Avaliar respiração · queimaduras · acionar 192', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-3': {
    family: 'protocolo',
    guideline: 'Trauma com palidez, sudorese fria, taquicardia e PA em queda — suspeita de choque hipovolêmico',
    roi_error: 'trauma_sinais_choque_hipovolemico',
    cluster: 'Emergência trauma — reconhecimento choque hipovolêmico',
    danger_footer: 'Gabarito A — choque hipovolêmico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trauma — suspeita de choque',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Trauma com palidez, sudorese fria, taquicardia e pressão em queda.', icon: 'Activity' },
          { label: 'Hipoperfusão', detail: 'Organos recebem menos sangue — prioridade de cuidado de enfermagem.', icon: 'HeartPulse' },
          { label: 'Hipovolêmico', detail: 'Perda de volume por hemorragia trauma — tipo mais provável aqui.', icon: 'Droplets' },
          { label: 'Pegadinha — asma', detail: 'Dispneia isolada sem hipotensão não explica o quadro completo.', icon: 'Wind' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sala de emergência — trauma com sinais de hipoperfusão:',
          'Eliminar asma estável — não explica taquicardia com PA em queda.',
          'Eliminar hipertensão controlada — oposto ao quadro.',
          'Eliminar enxaqueca simples — sem relação com choque.',
          'Eliminar dermatite alérgica leve — não urgência hemodinâmica.',
          'Choque hipovolêmico — marcar A.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHOQUE HIPOVOLÊMICO',
        rows: choqueTypesRows([{ label: 'Trauma', value: 'Hemorragia → hipovolemia → hipoperfusão', badge: 'hot' }]),
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780011859940-8': {
    family: 'protocolo',
    guideline: 'Instabilidade hemodinâmica — pele fria úmida, palidez/cianose e enchimento capilar prolongado',
    roi_error: 'sinais_hipoperfusao_periferica',
    cluster: 'APH — sinais de instabilidade hemodinâmica',
    danger_footer: 'Gabarito B — pele fria e TEC prolongado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipoperfusão — sinais periféricos',
        meta: slideMeta,
        items: [
          { label: 'Instabilidade', detail: 'Protocolo APH — reconhecer choque antes da deterioração.', icon: 'Gauge' },
          { label: 'Pele fria', detail: 'Vasoconstrição periférica — sangue centralizado.', icon: 'Thermometer' },
          { label: 'TEC > 2s', detail: 'Enchimento capilar lento — perfusão inadequada.', icon: 'Clock' },
          { label: 'Pegadinha — pele quente', detail: 'Rubor e TEC rápido sugerem hiperemia, não choque.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'APH — sinais compatíveis com instabilidade hemodinâmica:',
          'Eliminar pele quente com TEC < 1s — perfusão preservada.',
          'Eliminar bradicardia típica inicial em adulto choque — taquicardia compensatória é mais comum.',
          'Eliminar ausência de alterações periféricas — choque altera pele e pulso.',
          'Eliminar hipertensão sustentada como manifestação típica — hipotensão aparece na evolução.',
          'Pele fria, palidez/cianose e TEC > 2s — marcar B.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINAIS DE HIPOPERFUSÃO',
        rows: perfusaoRows(),
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563500147-8': {
    family: 'conceito',
    guideline: 'Semiologia do choque — hipotensão e pulso fraco são manifestações cardiocirculatórias clássicas',
    roi_error: 'semiologia_choque_pa_pulso',
    cluster: 'Semiologia — manifestações do choque',
    danger_footer: 'Gabarito E — PA baixa e pulso fraco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Semiologia — choque',
        meta: slideMeta,
        items: [
          { label: 'Choque', detail: 'Falha na perfusão tecidual — órgãos mal oxigenados.', icon: 'HeartPulse' },
          { label: 'Pressão baixa', detail: 'Hipotensão por débito cardíaco inadequado ou vasodilatação.', icon: 'TrendingDown' },
          { label: 'Pulso fraco', detail: 'Pulso filiforme — volume sistólico reduzido.', icon: 'Activity' },
          { label: 'Pegadinha — tosse', detail: 'Tosse seca aponta para vias aéreas, não choque isolado.', icon: 'Wind' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Paciente em choque — manifestação esperada:',
          'Eliminar tosse seca e dor torácica — quadro respiratório/cardíaco outro.',
          'Eliminar febre com sudorese — padrão infeccioso, não definição de choque.',
          'Eliminar cefaleia e visão turva — hipertensão ou neuro, não núcleo do choque.',
          'Eliminar náusea e diarreia isoladas — podem causar hipovolemia, mas não são manifestação direta.',
          'Pressão arterial baixa e pulso fraco — marcar E.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CHOQUE — CARDIOCIRCULATÓRIO',
        rows: perfusaoRows([{ label: 'Débito', value: 'Pulso fraco + hipotensão = baixo volume ejetado', badge: 'hot' }]),
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563517223-4': {
    family: 'conceito',
    guideline: 'Choque hipovolêmico — perda maciça de líquidos produz múltiplos sinais simultâneos de hipoperfusão',
    roi_error: 'hipovolemico_sinais_todos',
    cluster: 'Hipovolêmico — conjunto de manifestações clínicas',
    danger_footer: 'Gabarito E — todas as manifestações listadas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipovolêmico — quadro clínico',
        meta: slideMeta,
        items: [
          { label: 'Mecanismo', detail: 'Grande perda de líquidos e sangue — volume intravascular insuficiente.', icon: 'Droplets' },
          { label: 'Débito cardíaco', detail: 'Coração bombeia menos sangue — hipoperfusão sistêmica.', icon: 'Heart' },
          { label: 'Sinais múltiplos', detail: 'Alteração de consciência, pele fria, tremores e taquipneia podem coexistir.', icon: 'ListChecks' },
          { label: 'Pegadinha — um só sinal', detail: 'Choque grave raramente se manifesta por um único achado isolado.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque hipovolêmico — manifestações compatíveis:',
          'Avaliar A — possível perda de consciência por hipoperfusão cerebral.',
          'Avaliar B — pele fria e pegajosa por vasoconstrição.',
          'Avaliar C — tremores por liberação de catecolaminas.',
          'Avaliar D — respiração rápida e irregular por acidose e hipóxia.',
          'Todas as alternativas descrevem manifestações possíveis — marcar E.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIPOVOLÊMICO — SINAIS',
        rows: [
          { label: 'Neuro', value: 'Confusão ou perda de consciência', badge: 'warn' },
          { label: 'Pele', value: 'Fria, pegajosa, pálida', badge: 'hot' },
          { label: 'Resp', value: 'Taquipneia — compensação metabólica', badge: 'ok' },
          { label: 'Tremor', value: 'Resposta adrenérgica à hipoperfusão', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-4': {
    family: 'conceito',
    guideline: 'TCE grave — postura de descerebração indica lesão no tronco encefálico com pior prognóstico',
    roi_error: 'tce_descerebracao_postura',
    cluster: 'TCE — postura de descerebração × decorticação',
    danger_footer: 'Gabarito C — extensão rígida e lesão de tronco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TCE — posturas reflexas',
        meta: slideMeta,
        items: [
          { label: 'Avaliação neurológica', detail: 'Postura reflexa indica nível da lesão encefálica no trauma craniano.', icon: 'Brain' },
          { label: 'Descerebração', detail: 'Extensão rígida de membros — lesão mesencéfalo/ponte.', icon: 'AlertTriangle' },
          { label: 'Decorticação', detail: 'Flexão anormal de superiores — lesão cortical mais superficial.', icon: 'Activity' },
          { label: '≠ choque medular', detail: 'Flacidez pós-lesão medular — não é descerebração nem hipovolemia.', icon: 'Ban' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'TCE grave — postura de descerebração correta:',
          'Eliminar flexão de superiores com córtex preservado — descreve decorticação, não descerebração.',
          'Eliminar rigidez de nuca e Brudzinski — meningite, não postura descerebrada.',
          'Eliminar localização da dor — resposta motora voluntária, não postura reflexa.',
          'Eliminar flacidez pós choque medular — confunde com recuperação neurológica.',
          'Extensão rígida com lesão de tronco encefálico — marcar C.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POSTURAS REFLEXAS — TCE',
        rows: [
          { label: 'Decorticação', value: 'Flexão de MS · lesão supratentorial', badge: 'warn' },
          { label: 'Descerebração', value: 'Extensão rígida MS/MI · tronco encefálico', badge: 'hot' },
          { label: 'Prognóstico', value: 'Descerebração = lesão grave e pior prognóstico', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-6': {
    family: 'protocolo',
    guideline:
      'APH politrauma com choque — avaliação neurológica estruturada e imobilização antes do transporte (etapa D)',
    roi_error: 'aph_neuro_antes_transporte',
    cluster: 'APH politrauma — estabilização neurológica pré-transporte',
    danger_footer: 'Gabarito E — neuro estruturada antes do transporte',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'APH — politrauma e choque',
        meta: slideMeta,
        items: [
          { label: 'Cenário', detail: 'Inconsciente, respiração irregular, hemorragia ativa e sinais de choque.', icon: 'Activity' },
          { label: 'Hipoperfusão', detail: 'Choque exige circulação e volume — etapa C do atendimento.', icon: 'HeartPulse' },
          { label: 'Neuro (D)', detail: 'Avaliação neurológica estruturada orienta transporte seguro.', icon: 'Brain' },
          { label: 'Pegadinha — pular neuro', detail: 'Transportar sem avaliar/imobilizar coluna agrava lesão.', icon: 'AlertTriangle' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'APH politrauma — conduta priorizada pelo técnico (gabarito da prova):',
          'A hemorragia, vias aéreas, ventilação e circulação integram a sequência primária.',
          'A banca marca estabilização neurológica detalhada antes do transporte.',
          'Eliminar A isolado como única resposta — faz parte da sequência, não o foco cobrado.',
          'Eliminar B, C e D isolados — mesma lógica de etapas integradas.',
          'Estabilização neurológica estruturada antes do transporte — marcar E.',
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'APH — CHOQUE + NEURO',
        rows: [
          { label: 'Choque', value: 'Palidez, taquicardia, hipotensão — hipoperfusão', badge: 'hot' },
          { label: 'C', value: 'Circulação — controle hemorrágico e volume', badge: 'warn' },
          { label: 'D', value: 'Disability — Glasgow e imobilização cervical', badge: 'ok' },
          { label: 'Transporte', value: 'Só após neuro estruturada e cena segura', badge: 'info' },
        ],
        footer_rule: CHOQUE_L3_FOOTER,
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'cpcon-uepb-geral-urgencias-e-emergencias-1777103970505-0': {
    A: 'Examinar queimaduras vem depois de desenergizar e avaliar consciência.',
    B: 'Puxar fio com as mãos mantém risco de choque elétrico no socorrista.',
    C: 'Socorrer antes de cortar corrente inverte a sequência de segurança.',
    D: 'Puxar vítima pelas mãos conduz eletricidade — usar isolante após desligar.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-3': {
    B: 'Asma estável não explica hipotensão e palidez no trauma.',
    C: 'Hipertensão controlada contradiz pressão arterial em queda.',
    D: 'Enxaqueca não integra quadro de hipoperfusão no trauma.',
    E: 'Dermatite leve não é emergência hemodinâmica.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780011859940-8': {
    A: 'Pele quente e TEC rápido indicam boa perfusão periférica.',
    C: 'Adulto em choque costuma taquicardizar, não bradicardia inicial típica.',
    D: 'Choque altera pele, pulso e TEC — perfusão não fica preservada.',
    E: 'Hipertensão sustentada não é manifestação clássica do choque.',
  },
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563500147-8': {
    A: 'Tosse seca isolada não define choque circulatório.',
    B: 'Febre com sudorese sugere processo infeccioso, não núcleo semiológico do choque.',
    C: 'Cefaleia e visão turva apontam para outras causas neurológicas/vasculares.',
    D: 'Gastroenterite pode causar hipovolemia, mas não é manifestação direta listada.',
  },
  'avancasp-enfermagem-semiologia-em-enfermagem-1779563517223-4': {
    A: 'Perda de consciência é manifestação possível — não exclui as demais.',
    B: 'Pele fria e pegajosa integra o quadro hipovolêmico.',
    C: 'Tremores podem acompanhar hipoperfusão grave.',
    D: 'Taquipneia irregular também é compatível com choque.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780001517858-4': {
    A: 'Flexão de MS com córtex preservado descreve decorticação, não descerebração.',
    B: 'Brudzinski e rigidez de nuca sugerem meningite — outro contexto.',
    D: 'Localizar dor é resposta motora voluntária — não postura descerebrada.',
    E: 'Flacidez pós lesão medular confunde com recuperação — não é descerebração.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-6': {
    A: 'Controle de hemorragia é etapa X/C — a banca cobra foco neurológico pré-transporte.',
    B: 'Vias aéreas fazem parte da sequência — gabarito E integra neuro antes de mover.',
    C: 'Ventilação é etapa B — não responde ao comando de priorização da prova.',
    D: 'Circulação trata choque — E acrescenta avaliação neurológica estruturada antes do transporte.',
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
    console.log(`[handcraft:urgencias-g19] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g19] total=${ok}`);
}

main();
