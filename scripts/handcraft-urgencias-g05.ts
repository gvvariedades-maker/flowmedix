#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g05 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g05.ts
 *   npx tsx scripts/handcraft-urgencias-g05.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  dangerFromOptions,
  metaBase,
  rcpParamRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpGolden';

const LOTE = 'urgencias-g05';
const REVIEWER = 'handcraft-urgencias-g05';

const SPECS: Record<string, Pack> = {
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-9': {
    family: 'conceito',
    guideline: 'Parada cardiorrespiratória = emergência clínica — risco iminente à vida',
    roi_error: 'pcr_emergencia_classificacao',
    cluster: 'Classificação — parada cardiorrespiratória como emergência',
    danger_footer: 'PCR é emergência — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Emergência clínica',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Emergência máxima — iniciar RCP/SBV imediatamente.',
            icon: 'HeartPulse',
          },
          {
            label: 'Urgência × emergência',
            detail: 'Emergência = risco iminente à vida; PCR não pode esperar.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Rotina hospitalar',
            detail: 'Banho de leito, cirurgia eletiva, puericultura — não são emergência.',
            icon: 'Calendar',
          },
          {
            label: 'Pegadinha — rotina',
            detail: 'Confundir procedimento eletivo ou rastreamento com emergência clínica.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'PCR → compressões torácicas agora',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Qual alternativa caracteriza emergência clínica?',
          'Eliminar banho de leito (rotina).',
          'Eliminar cirurgia eletiva e puericultura.',
          'Eliminar mamografia (rastreamento).',
          'Parada cardiorrespiratória — emergência com RCP imediata.',
          'Marcar D.',
        ],
        footer_rule: 'Emergência = risco imediato à vida',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO SBV',
        rows: [
          { label: 'Emergência', value: 'Parada cardiorrespiratória · inconsciência com apneia', badge: 'hot' },
          { label: 'Urgência', value: 'Dor estável · procedimentos programados', badge: 'ok' },
          { label: 'Conduta PCR', value: 'Reconhecer → acionar → compressões 100–120/min', badge: 'warn' },
        ],
        footer_rule: 'PCR nunca espera fila',
      },
      null as unknown,
    ],
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-9': {
    family: 'protocolo',
    guideline: 'PCR pós-opioides — naloxona após ROSC com depressão respiratória persistente',
    roi_error: 'pcr_opioides_naloxona',
    cluster: 'PCR por intoxicação por opioides — antídoto',
    danger_footer: 'Suspeita de opioides — naloxona — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR e opioides',
        meta: slideMeta,
        items: [
          {
            label: 'Caso clínico',
            detail: 'Rebaixamento de consciência, bradipneia → parada cardiorrespiratória → RCP.',
            icon: 'User',
          },
          {
            label: 'ROSC',
            detail: 'Retorno da circulação com ventilação inadequada — suspeitar overdose.',
            icon: 'HeartPulse',
          },
          {
            label: 'Naloxona',
            detail: 'Antagonista opioide — indicada na suspeita de intoxicação por opioides.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — outras causas',
            detail: 'TEP, pneumotórax, tamponamento — não explicam bradipneia isolada sem trauma.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Opioide + PCR → naloxona após ROSC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR com ROSC e depressão respiratória — por que naloxona?',
          'Eliminar tromboembolismo pulmonar (A).',
          'Eliminar pneumotórax hipertensivo (B).',
          'Eliminar acidose metabólica isolada (C).',
          'Eliminar tamponamento cardíaco (E).',
          'Intoxicação por opioides — marcar D.',
        ],
        footer_rule: 'Bradipneia + inconsciência → pensar em opioide',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NALOXONA NA PCR',
        rows: [
          { label: 'Suspeita', value: 'Bradipneia + rebaixamento + PCR reversível', badge: 'hot' },
          { label: 'RCP', value: 'Compressões torácicas antes de qualquer droga', badge: 'ok' },
          { label: 'Pós-ROSC', value: 'Naloxona se depressão respiratória por opioides', badge: 'warn' },
          { label: 'Não é', value: 'TEP · pneumotórax · tamponamento neste quadro', badge: 'info' },
        ],
        footer_rule: 'Tratar causa reversível após estabilizar',
      },
      null as unknown,
    ],
  },
  'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6': {
    family: 'protocolo',
    guideline: 'AHA 2020 — 30:2 sem via aérea avançada; 100–120/min; profundidade 5–6 cm; troca a cada 2 min',
    roi_error: 'aha_2020_30_2_ventilacoes',
    cluster: 'RCP adulto AHA 2020 — proporção e qualidade das compressões',
    danger_footer: '30 compressões : 2 ventilações — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP AHA 2020',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'RCP em adulto — compressões torácicas de alta qualidade imediatas.',
            icon: 'HeartPulse',
          },
          {
            label: 'Proporção SBV',
            detail: 'Duas ventilações a cada 30 compressões sem via aérea avançada.',
            icon: 'Activity',
          },
          {
            label: 'Frequência',
            detail: '100 a 120 compressões por minuto no adulto.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — proporção e profundidade',
            detail: 'Trocar 30:2 por proporções erradas ou profundidade de 4 cm e frequência lenta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '30:2 · 100–120/min · 5–6 cm',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'AHA 2020 — ressuscitação cardiopulmonar em adulto com parada cardiorrespiratória?',
          'Eliminar troca de socorrista em intervalo longo (A) — correto ~a cada 2 minutos.',
          'Eliminar frequência 80–100/min (B).',
          'Eliminar profundidade mínima 4 cm (C).',
          'Correto: duas ventilações a cada 30 compressões sem via aérea avançada.',
          'Marcar D.',
        ],
        footer_rule: 'Qualidade das compressões primeiro',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — AHA 2020',
        rows: rcpParamRows([
          { label: 'Troca', value: 'Alternar socorrista ~a cada 2 minutos', badge: 'warn' },
        ]),
        footer_rule: '30:2 sem intubação precoce',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — aha 2020 30 2 ventilacoes',
        items: [
          {
            label: 'Letra A — troca em intervalo longo',
            detail: 'Intervalo longo para alternar compressores na parada cardiorrespiratória.',
            correct: 'Trocar socorrista ~a cada 2 minutos — intervalo prolongado reduz qualidade da RCP.',
          },
          {
            label: 'Letra B — frequência 80 a 100/min',
            detail: 'Faixa abaixo do alvo atual de compressões torácicas.',
            correct: 'Frequência correta: 100 a 120 compressões/min.',
          },
          {
            label: 'Letra C — profundidade 4 cm',
            detail: 'Profundidade insuficiente para adulto em parada cardiorrespiratória.',
            correct: 'Profundidade AHA: pelo menos 5 cm até 6 cm.',
          },
        ],
        footer_rule: 'Gabarito D — 30:2 sem via aérea avançada',
      },
    ],
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010911471-0': {
    family: 'protocolo',
    guideline: 'Identificação PCR — responsividade → respiração (ver, ouvir, sentir) → pulso carótida',
    roi_error: 'identificacao_pcr_sequencia',
    cluster: 'Avaliação inicial — reconhecimento da parada cardiorrespiratória',
    danger_footer: 'Responsividade → respiração → pulso carótida — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reconhecer PCR',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Interrupção súbita das funções cardíaca e respiratória — iniciar RCP/SBV.',
            icon: 'HeartPulse',
          },
          {
            label: 'Responsividade',
            detail: 'Estímulos verbais e físicos na avaliação inicial da parada cardiorrespiratória.',
            icon: 'User',
          },
          {
            label: 'Respiração',
            detail: 'Método ver, ouvir e sentir — apneia ou gasping na PCR.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — ordem invertida',
            detail: 'Pulso antes de consciência ou compressões torácicas antes de qualquer avaliação.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'SBV: checar antes de comprimir',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sequência correta de identificação da parada cardiorrespiratória?',
          'Eliminar pulso antes de consciência (A).',
          'Eliminar estímulo doloroso sem avaliar verbal (B).',
          'Eliminar massagem antes de qualquer avaliação (C).',
          'Responsividade → respiração ver/ouvir/sentir → pulso carótida.',
          'Marcar D.',
        ],
        footer_rule: 'Identificar PCR em segundos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEQUÊNCIA — PCR',
        rows: [
          { label: '1', value: 'Responsividade (verbal + físico)', badge: 'hot' },
          { label: '2', value: 'Respiração — ver, ouvir e sentir', badge: 'ok' },
          { label: '3', value: 'Pulso carótida se inconsciente e sem respiração', badge: 'ok' },
          { label: '4', value: 'Iniciar RCP de alta qualidade', badge: 'warn' },
        ],
        footer_rule: 'Reconhecimento precoce salva vidas',
      },
      null as unknown,
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104077075-9': {
    family: 'protocolo',
    guideline: 'AHA 2020 — 100–120 compressões/min; profundidade ≥5 cm; desfibrilar após RCP (sem trauma)',
    roi_error: 'aha_2020_qualidade_compressoes',
    cluster: 'RCP AHA 2020 — frequência e profundidade no adulto',
    danger_footer: '100–120/min · ≥5 cm — desfibrilar após compressões — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AHA 2020 — PCR adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Sem trauma — RCP de alta qualidade e desfibrilação quando disponível.',
            icon: 'HeartPulse',
          },
          {
            label: 'Frequência',
            detail: '100 a 120 compressões cardíacas por minuto no adulto.',
            icon: 'Gauge',
          },
          {
            label: 'Profundidade',
            detail: 'Pelo menos 5 cm de profundidade nas compressões torácicas.',
            icon: 'ArrowDown',
          },
          {
            label: 'Pegadinha — ordem e alvo',
            detail: 'Desfibrilar antes de comprimir ou frequência lenta e profundidade insuficiente.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Comprimir forte, rápido e fundo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'AHA 2020 — parada cardiorrespiratória sem trauma: recomendação correta?',
          'Eliminar ECG antes de manobras para definir quantidade de compressões (A).',
          'Eliminar frequência 80–100/min (B).',
          'Eliminar desfibrilação antes de iniciar compressões (C).',
          'Correto: 100–120/min com profundidade ≥5 cm.',
          'Marcar D.',
        ],
        footer_rule: 'RCP antes do DEA quando aplicável',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — AHA 2020',
        rows: rcpParamRows(),
        footer_rule: 'Qualidade das compressões determina sobrevida',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — aha 2020 qualidade compressoes',
        items: [
          {
            label: 'Letra A — ECG antes das manobras',
            detail: 'Atrasar compressões torácicas para definir quantidade pelo traçado.',
            correct: 'Iniciar RCP imediata — não esperar eletrocardiograma na PCR.',
          },
          {
            label: 'Letra B — frequência lenta',
            detail: 'Faixa abaixo do alvo atual de compressões no adulto.',
            correct: 'Frequência correta: 100 a 120 compressões por minuto.',
          },
          {
            label: 'Letra C — desfibrilar antes de comprimir',
            detail: 'Ordem invertida na parada cardiorrespiratória.',
            correct: 'RCP de alta qualidade antes da desfibrilação precoce.',
          },
          {
            label: 'Letra E — só ventilar sem pulso',
            detail: 'Abandona compressões torácicas na PCR.',
            correct: 'PCR exige compressões — não descartar massagem cardíaca.',
          },
        ],
        footer_rule: 'Gabarito D — 100–120/min · ≥5 cm',
      },
    ],
  },
  'quadrix-enfermagem-urgencias-e-emergencias-1780001220945-5': {
    family: 'protocolo',
    guideline: 'RCP extra-hospitalar — dois socorristas: 30 compressões : 2 ventilações',
    roi_error: 'rcp_30_2_extra_hospitalar',
    cluster: 'RCP adulto — proporção 30:2 com dois socorristas',
    danger_footer: 'Dois socorristas extra-hospitalar: 30:2 — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: '30:2 — dois socorristas',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'RCP necessária — ambiente extra-hospitalar com dois socorristas.',
            icon: 'HeartPulse',
          },
          {
            label: 'Proporção correta',
            detail: '30 compressões torácicas para cada 2 ventilações.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — proporções',
            detail: '2:6, 30:1, 60:2 ou 120:6 — valores inventados pela banca.',
            icon: 'Hash',
          },
          {
            label: 'C-A-B',
            detail: 'Compressão antes de ventilação no adulto em PCR.',
            icon: 'ArrowRight',
          },
        ],
        footer_rule: 'Decore: 30:2 no adulto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'RCP extra-hospitalar — dois socorristas: proporção correta?',
          'Eliminar proporção com tempo prolongado de compressão (A).',
          'Eliminar 30:1 e 60:2 (B, D).',
          'Eliminar 120:6 (E).',
          '30 compressões para 2 ventilações.',
          'Marcar C.',
        ],
        footer_rule: '30:2 — solo ou dupla',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — 30:2',
        rows: rcpParamRows(),
        footer_rule: 'Extra-hospitalar: comprimir forte e rápido',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — rcp 30 2 extra hospitalar',
        items: [
          {
            label: 'Letra A — 2 minutos para 6 ventilações',
            detail: 'Proporção inventada na ressuscitação cardiopulmonar extra-hospitalar.',
            correct: 'Pegadinha numérica — não é 2:6 no adulto com dois socorristas.',
          },
          {
            label: 'Letra B — 30 compressões para 1 ventilação',
            detail: 'Relação compressão-ventilação incorreta na parada cardiorrespiratória.',
            correct: 'Correto é 30 compressões para 2 ventilações — não 30:1.',
          },
          {
            label: 'Letra D — 60 compressões para 2 ventilações',
            detail: 'Proporção fora do algoritmo AHA para dois socorristas.',
            correct: '60:2 não é padrão SBV — decore 30:2.',
          },
          {
            label: 'Letra E — 120 compressões para 6 ventilações',
            detail: 'Valor inventado pela banca na RCP extra-hospitalar.',
            correct: '120:6 não existe no algoritmo — gabarito é 30:2.',
          },
        ],
        footer_rule: 'Gabarito C — 30 compressões : 2 ventilações',
      },
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-7': {
    family: 'protocolo',
    guideline: 'SBV adulto — monitorização hemodinâmica após reanimação; compressões antes de punção',
    roi_error: 'sbv_monitorizacao_pos_rcp',
    cluster: 'RCP básica adulto — sequência e monitorização',
    danger_footer: 'Pressão arterial após reanimação completa — gabarito E',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SBV — sequência correta',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Reanimação cardiorrespiratória básica — compressões torácicas imediatas.',
            icon: 'HeartPulse',
          },
          {
            label: 'Prioridades',
            detail: 'Responsividade → RCP de alta qualidade → desfibrilação quando indicada.',
            icon: 'Activity',
          },
          {
            label: 'Monitorização',
            detail: 'Pressão arterial após completada a reanimação — não antes das manobras.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — ordem invertida',
            detail: 'Desfibrilação antes de ventilação ou punção venosa antes de massagem cardíaca.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Comprimir primeiro — monitorar depois',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Medidas de reanimação cardiorrespiratória básica no adulto — correta?',
          'Eliminar desfibrilação antecedendo ventilação (A).',
          'Eliminar punção venosa antes de massagem cardíaca (B).',
          'Eliminar responsividade como única medida inicial sem RCP (C).',
          'Eliminar oximetria sem valor sem O2 (D).',
          'Monitorização da pressão arterial só após completada a reanimação.',
          'Marcar E.',
        ],
        footer_rule: 'SBV: manobras salvam — PA depois',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SBV — ADULTO',
        rows: rcpParamRows([
          { label: 'Ordem', value: 'Responsividade → RCP → DEA', badge: 'hot' },
          { label: 'Monitor', value: 'PA e oximetria após estabilizar ROSC', badge: 'warn' },
        ]),
        footer_rule: 'Não atrasar compressões por acesso venoso',
      },
      null as unknown,
    ],
  },
  'unifil-enfermagem-processo-de-enfermagem-1780004469060-1': {
    family: 'protocolo',
    guideline: 'ILCOR/SBV — dispositivos mecânicos de RCP podem ser considerados em situações selecionadas',
    roi_error: 'ilcor_rcp_mecanica',
    cluster: 'Diretrizes ILCOR — Suporte Básico de Vida adulto',
    danger_footer: 'RCP mecânica pode ser considerada — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ILCOR — SBV adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'RCP de alta qualidade — compressões 100–120/min no adulto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Dispositivos mecânicos',
            detail: 'Podem ser considerados em situações selecionadas — diretriz ILCOR.',
            icon: 'Cog',
          },
          {
            label: 'C-A-B',
            detail: 'Compressões torácicas antes de ventilação na PCR adulta.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — prioridades',
            detail: 'Ventilar antes de comprimir ou expor paciente antes da RCP.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Qualidade das compressões é central',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'ILCOR — Suporte Básico de Vida em adultos com parada cardiorrespiratória?',
          'Eliminar ventilação antes de compressões (A).',
          'Eliminar retirada de vestimentas como prioridade (B).',
          'Eliminar naloxona antes de compressões em overdose (D).',
          'Uso de dispositivos mecânicos de RCP pode ser considerado.',
          'Marcar C.',
        ],
        footer_rule: 'Tecnologia auxilia — não substitui SBV precoce',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ILCOR — RCP',
        rows: rcpParamRows([
          { label: 'Mecânica', value: 'Dispositivos de RCP em situações selecionadas', badge: 'hot' },
          { label: 'Via aérea', value: 'Compressões antes de ventilação no adulto', badge: 'ok' },
        ]),
        footer_rule: 'SBV humano primeiro — mecânico quando indicado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ilcor rcp mecanica',
        items: [
          {
            label: 'Letra A — ventilação antes de compressões',
            detail: 'Inverte prioridade C-A-B na parada cardiorrespiratória adulta.',
            correct: 'Compressões torácicas vêm antes de ventilação no adulto em PCR.',
          },
          {
            label: 'Letra B — retirar vestimentas na mulher',
            detail: 'Prioriza exposição em detrimento das compressões imediatas.',
            correct: 'RCP não deve aguardar retirada completa de roupas — comprimir já.',
          },
          {
            label: 'Letra D — naloxona antes de compressões',
            detail: 'Posterga ressuscitação cardiopulmonar na overdose de opioides.',
            correct: 'Compressões torácicas primeiro — naloxona conforme protocolo avançado.',
          },
        ],
        footer_rule: 'Gabarito C — RCP mecânica pode ser considerada',
      },
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-9': {
    A: 'Banho de leito é cuidado de rotina — não emergência clínica.',
    B: 'Cirurgia eletiva é procedimento programado — não emergência.',
    C: 'Puericultura é acompanhamento preventivo — não emergência.',
    E: 'Mamografia é rastreamento — parada cardiorrespiratória sim é emergência.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-9': {
    A: 'TEP não explica bradipneia isolada sem contexto tromboembólico.',
    B: 'Pneumotórax hipertensivo exige trauma/instabilidade — outro quadro.',
    C: 'Acidose metabólica isolada não justifica naloxona na PCR.',
    E: 'Tamponamento cardíaco — apresentação hemodinâmica distinta.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010911471-0': {
    A: 'Pulso antes de consciência — ordem invertida na identificação da parada cardiorrespiratória.',
    B: 'Estímulo doloroso sem avaliar verbal — sequência incorreta no SBV.',
    C: 'Compressões torácicas antes de avaliar — viola reconhecimento da PCR.',
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-7': {
    A: 'Desfibrilação antes de ventilação — ordem invertida no SBV.',
    B: 'Punção venosa antes de massagem cardíaca — atrasa compressões na PCR.',
    C: 'Só verificar responsividade sem iniciar RCP — conduta incompleta.',
    D: 'Oximetria sempre útil no atendimento — afirmativa incorreta.',
  },
};

function finalizeSlides(slug: string, q: Q, pack: Pack): unknown[] {
  return pack.slides.map((slide) => {
    if (slide !== null) return slide;
    const overrides = DANGER_OVERRIDES[slug];
    if (!overrides) throw new Error(`danger_zone missing for ${slug}`);
    return dangerFromOptions(
      q,
      `PEGADINHAS — ${pack.roi_error.replace(/_/g, ' ')}`,
      overrides,
      pack.danger_footer ??
        `Gabarito ${q.question_data.options.find((o) => o.is_correct)?.id} — ${pack.cluster}`,
    );
  });
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack);
    const out = {
      meta: metaBase(
        raw,
        pack.family,
        pack.guideline,
        slug,
        pack.roi_error,
        pack.cluster,
        REVIEWER,
      ),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g05] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g05] total=${ok}`);
}

main();
