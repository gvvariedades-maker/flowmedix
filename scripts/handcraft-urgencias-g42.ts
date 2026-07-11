#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g42 (8 slugs · 13º lote urgencias_generico).
 * Inferência: SAMU/APH/ambulância → generico · TCE sinais/queda → generico (1 hit trauma) · IC posição → generico (sem IAM).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasGenericoGolden';

const LOTE = 'urgencias-g42';
const REVIEWER = 'handcraft-urgencias-g42';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';

const AMBULANCIA_TIPO_C_SALVAMENTO = [
  { label: 'Tipo C', value: 'URPH com equipamentos de salvamento — acidentes e acesso difícil', badge: 'hot' },
  { label: 'Salvamento', value: 'Terrestre · aquático · altura — perfil de resgate', badge: 'ok' },
  { label: '× Tipo A', value: 'Transporte simples de enfermos — sem resgate especializado', badge: 'warn' },
  { label: '× Tipo B', value: 'Suporte básico — não equipamento de salvamento em altura/água', badge: 'info' },
  { label: 'Pegadinha', value: 'Confundir resgate (C) com suporte avançado com médico (D)', badge: 'warn' },
];

const AMBULANCIA_TIPO_D_MEDICO = [
  { label: 'Tipo D', value: 'Suporte avançado — médico obrigatório na equipe', badge: 'hot' },
  { label: '× Tipo A', value: 'Remoção/transporte simples — sem médico fixo', badge: 'warn' },
  { label: '× Tipo B', value: 'Suporte básico — equipe sem médico obrigatório', badge: 'info' },
  { label: '× Tipo C', value: 'Resgate/salvamento — perfil distinto do avançado com médico', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca testa qual tipo exige médico na composição', badge: 'info' },
];

const IC_EAP_POSICAO = [
  { label: 'IC / EAP', value: 'Insuficiência cardíaca · edema agudo de pulmão — dispneia paroxística', badge: 'hot' },
  { label: 'Posição', value: 'Sentado · pernas pendentes/rebaixadas — reduz retorno venoso pulmonar', badge: 'ok' },
  { label: 'Decúbito elevado', value: 'Facilita expansão pulmonar e alivia congestão', badge: 'ok' },
  { label: '× Trendelenburg', value: 'Eleva membros inferiores — aumenta congestão pulmonar', badge: 'warn' },
  { label: '× Kraske/lateral', value: 'Posições operatorias — não reduzem congestão do EAP', badge: 'warn' },
];

const TCE_SINAIS_NEURO = [
  { label: 'TCE', value: 'Trauma cranioencefálico — lesão do encéfalo', badge: 'hot' },
  {
    label: 'Sinais',
    value: 'Cefaleia · náuseas · letargia · hemiparesia · pupilas assimétricas',
    badge: 'ok',
  },
  { label: '× Torácico', value: 'Dispneia · dor torácica · murmúrio vesicular — sem foco neurológico', badge: 'warn' },
  { label: '× Abdominal', value: 'Distensão · defesa · dor epigástrica — vísceras, não crânio', badge: 'info' },
  { label: '× TRH', value: 'Raquimedular — déficit medular abaixo da lesão, não hemiparesia típica de TCE', badge: 'warn' },
];

const SAMU_CODIGO_AMARELO = [
  { label: 'Código amarelo', value: 'Urgência — sem risco imediato à vida', badge: 'hot' },
  { label: 'Saída da base', value: '2 minutos após recepção do chamado (literal da banca)', badge: 'ok' },
  { label: '× Prazo curto', value: 'Alternativa com intervalo inferior ao cobrado para amarelo', badge: 'warn' },
  { label: '× Prazo médio/longo', value: 'Outros intervalos numéricos — não correspondem ao amarelo desta questão', badge: 'info' },
  { label: 'Pegadinha', value: 'Banca troca minutos entre códigos de gravidade', badge: 'warn' },
];

const TARM_PAPEIS = [
  { label: 'TARM', value: 'Técnico Auxiliar em Regulação Médica — apoio à CRMU/SAMU', badge: 'hot' },
  { label: 'Função', value: 'Anotar dados básicos do chamado · prestar informações gerais', badge: 'ok' },
  { label: '× Medicar', value: 'Administrar medicações — equipe móvel ou hospital', badge: 'warn' },
  { label: '× Cirurgia', value: 'Procedimento cirúrgico de emergência — médico/cirurgião', badge: 'warn' },
  { label: '× Condução', value: 'Transporte ao hospital — condutor ou equipe móvel', badge: 'info' },
];

const START_TRIAGEM = [
  { label: 'START', value: 'Simple Triage And Rapid Treatment — triagem em massa no APH', badge: 'hot' },
  {
    label: 'Objetivo',
    value: 'Classificar vítimas por gravidade · priorizar cuidados e chances de sobrevivência',
    badge: 'ok',
  },
  { label: '× Rastreio câncer', value: 'Vigilância populacional — não triagem de emergência', badge: 'warn' },
  { label: '× Pré-natal', value: 'Rastreio fetal — contexto obstétrico, não desastre', badge: 'info' },
  { label: '× Sintoma único', value: 'Rastrear doença específica — não método START', badge: 'warn' },
];

const TCE_QUEDA_PROTOCOLO = [
  { label: 'Cenário', value: 'Queda de altura · trauma craniano · confusão · dor occipital', badge: 'hot' },
  { label: 'Sinais vitais', value: 'Aferir PA · FC · FR · SpO₂ — monitorização contínua', badge: 'ok' },
  { label: 'Pupilas', value: 'Avaliar tamanho · simetria · reatividade', badge: 'ok' },
  { label: 'Coluna', value: 'Estabilização manual cervical até imobilização adequada', badge: 'warn' },
  { label: 'Glasgow seriado', value: 'Reavaliar nível de consciência mesmo com resposta verbal inicial', badge: 'hot' },
];

type Spec = { pack: Pack; danger: Record<string, string> };

const SPECS: Record<string, Spec> = {
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104000896-8': {
    pack: {
      family: 'protocolo',
      guideline:
        'Classificação Access — Tipo C = URPH com equipamentos de salvamento (terrestre, aquático, altura) para acidentes e locais de difícil acesso',
      roi_error: 'ambulancia_tipo_c_salvamento',
      cluster: 'SAMU — ambulância tipo C resgate/salvamento',
      danger_footer: 'Gabarito C — tipo C salvamento',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Ambulâncias — tipo C',
          meta: slideMeta,
          items: [
            {
              label: 'Definição',
              detail: 'Veículo destinado ao transporte de enfermos — classificação por suporte e função.',
              icon: 'Ambulance',
            },
            {
              label: 'Perfil C',
              detail: 'URPH em acidentes ou locais de difícil acesso — equipamentos de salvamento.',
              icon: 'Mountain',
            },
            {
              label: 'Salvamento',
              detail: 'Terrestre · aquático · altura — resgate especializado.',
              icon: 'LifeBuoy',
            },
            {
              label: 'Pegadinha — tipo A/B',
              detail: 'Transporte simples ou suporte básico sem perfil de resgate.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — tipo D',
              detail: 'Suporte avançado com médico — função distinta do resgate tipo C.',
              icon: 'Ban',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'Ambulância com equipamentos de salvamento em acidentes/acesso difícil — qual tipo?',
            'Tipo A — transporte simples — eliminar.',
            'Tipo B — suporte básico sem resgate especializado — eliminar.',
            'Tipo D — suporte avançado com médico — perfil diferente.',
            'Tipo C — URPH com salvamento terrestre · aquático · altura.',
            'Marcar C.',
            'Fixação: resgate difícil = tipo C nesta classificação Access.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Ambulâncias — decore',
          meta: slideMeta,
          content: 'CLASSIFICAÇÃO — TIPO C',
          rows: AMBULANCIA_TIPO_C_SALVAMENTO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Tipo A é transporte simples — não inclui equipamentos de salvamento em altura, água ou resgate.',
      B: 'Tipo B é suporte básico — não descreve veículo de resgate com equipamentos especializados.',
      D: 'Tipo D exige médico na equipe — perfil de suporte avançado, não resgate tipo C.',
    },
  },
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-0': {
    pack: {
      family: 'protocolo',
      guideline:
        'IC com edema agudo de pulmão — decúbito elevado e posição sentada com pernas rebaixadas (pêndulas) para reduzir congestão pulmonar',
      roi_error: 'ic_eap_posicao_sentado',
      cluster: 'IC — posicionamento em edema agudo de pulmão',
      danger_footer: 'Gabarito A — sentado pêndulas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'IC — posicionamento',
          meta: slideMeta,
          items: [
            {
              label: 'IC / EAP',
              detail: 'Insuficiência cardíaca descompensada — edema agudo de pulmão com dispneia.',
              icon: 'HeartPulse',
            },
            {
              label: 'Posição correta',
              detail: 'Sentado · pernas pendentes para fora da maca — reduz pré-carga pulmonar.',
              icon: 'Armchair',
            },
            {
              label: 'Decúbito elevado',
              detail: 'Cabeceira elevada facilita expansão pulmonar anterior.',
              icon: 'TrendingUp',
            },
            {
              label: 'Pegadinha — lateral',
              detail: 'Posição lateral esquerda — não reduz congestão pulmonar do EAP.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — Trendelenburg/Kraske',
              detail: 'Posições operatorias — pioram congestão ou não reduzem edema agudo de pulmão.',
              icon: 'Ban',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'IC com edema agudo de pulmão — posição de conforto e redução de congestão?',
            'B posição lateral esquerda — eliminar — não alivia congestão pulmonar.',
            'C Trendelenburg — eliminar — aumenta retorno venoso e piora dispneia.',
            'D Kraske — eliminar — posição prona operatoria.',
            'A sentado com pernas rebaixadas (pêndulas) — reduz retorno venoso pulmonar.',
            'Marcar A.',
            'Fixação: EAP = sentado · pernas pendentes · decúbito elevado.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'EAP — decore posição',
          meta: slideMeta,
          content: 'IC — POSICIONAMENTO',
          rows: IC_EAP_POSICAO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      B: 'Posição lateral esquerda não reduz congestão pulmonar do edema agudo — conduta inadequada para EAP.',
      C: 'Trendelenburg eleva membros inferiores e aumenta retorno venoso — agrava dispneia paroxística.',
      D: 'Kraske é posição prona para procedimentos — não reduz edema agudo de pulmão.',
    },
  },
  'instituto-consulplan-enfermagem-semiologia-em-enfermagem-1779563531989-1': {
    pack: {
      family: 'conceito',
      guideline:
        'Cefaleia · náuseas · letargia · hemiparesia · pupilas assimétricas — quadro neurológico compatível com trauma cranioencefálico (TCE)',
      roi_error: 'tce_sinais_neurologicos',
      cluster: 'TCE — semiologia neurológica (1 hit trauma)',
      danger_footer: 'Gabarito D — TCE',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TCE — reconhecer sinais',
          meta: slideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Sinais neurológicos após trauma — identificar qual tipo de lesão.',
              icon: 'Brain',
            },
            {
              label: 'TCE',
              detail: 'Cefaleia · vômitos · letargia · hemiparesia · pupilas assimétricas.',
              icon: 'Skull',
            },
            {
              label: 'Gravidade',
              detail: 'Pode evoluir para morte ou sequelas irreversíveis — monitorar consciência.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — torácico',
              detail: 'Dispneia e dor torácica — sem hemiparesia ou pupilas assimétricas típicas.',
              icon: 'Wind',
            },
            {
              label: 'Pegadinha — TRH',
              detail: 'Raquimedular — déficit abaixo da lesão medular, perfil distinto.',
              icon: 'Ban',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'Trauma com cefaleia · náuseas · letargia · hemiparesia · pupilas assimétricas — qual tipo?',
            'A torácico — eliminar — foco respiratório/torácico, não neurológico central.',
            'B abdominal — eliminar — vísceras abdominais, sem hemiparesia típica.',
            'C raquimedular — eliminar — lesão medular, não encéfalo.',
            'D cranioencefálico (TCE) — lesão do encéfalo compatível com o quadro.',
            'Marcar D.',
            'Fixação: sinais neurológicos focais + trauma craniano = TCE.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'TCE — sinais decore',
          meta: slideMeta,
          content: 'TRAUMA CRANIOENCEFÁLICO',
          rows: TCE_SINAIS_NEURO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Trauma torácico cursa com dispneia e dor torácica — não explica hemiparesia e pupilas assimétricas.',
      B: 'Trauma abdominal foca vísceras e dor abdominal — sem o padrão neurológico central descrito.',
      C: 'TRH lesa medula — déficit abaixo do nível da lesão; hemiparesia e pupilas assimétricas apontam encéfalo.',
    },
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-8': {
    pack: {
      family: 'protocolo',
      guideline:
        'SAMU — tempo de saída da base após recepção do chamado em código amarelo: 2 minutos (literal da banca)',
      roi_error: 'samu_codigo_amarelo_2min',
      cluster: 'SAMU — deslocamento código amarelo',
      danger_footer: 'Gabarito B — 2 minutos',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'SAMU — despacho amarelo',
          meta: slideMeta,
          items: [
            {
              label: 'CRMU',
              detail: 'Central recebe chamada 192 · classifica gravidade · despacha unidade móvel.',
              icon: 'Phone',
            },
            {
              label: 'Código amarelo',
              detail: 'Urgência sem risco iminente à vida — prioridade intermediária no despacho.',
              icon: 'AlertCircle',
            },
            {
              label: 'Relógio da base',
              detail: 'Cronometragem inicia na recepção do chamado até saída do veículo.',
              icon: 'Clock',
            },
            {
              label: 'Pegadinha — vermelho',
              detail: 'Confundir prazo do amarelo com código de emergência máxima.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — hospital',
              detail: 'Tempo de deslocamento no trânsito ≠ tempo de saída da base.',
              icon: 'Ban',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'SAMU — saída da base após chamado em código amarelo — quanto tempo?',
            'A prazo curto — eliminar — inferior ao intervalo cobrado.',
            'C prazo médio — eliminar — não é o literal da banca.',
            'D prazo longo — eliminar — não corresponde ao amarelo desta questão.',
            'B 2 minutos — tempo previsto para deslocamento da base.',
            'Marcar B.',
            'Fixação: amarelo = 2 minutos (literal Consulplan).',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Amarelo — decore prazo',
          meta: slideMeta,
          content: 'DESPACHO — CÓDIGO AMARELO',
          rows: SAMU_CODIGO_AMARELO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: slideMeta,
          content: 'PEGADINHAS — prazos numéricos',
          items: [
            {
              label: 'Letra A — prazo curto',
              detail: 'Alternativa com intervalo inferior ao cobrado para amarelo.',
              correct: 'Prazo curto demais — a banca fixa 2 minutos para saída da base em código amarelo.',
            },
            {
              label: 'Letra C — prazo médio',
              detail: 'Intervalo numérico intermediário entre as opções.',
              correct: 'Não corresponde ao tempo previsto para saída da base nesta questão.',
            },
            {
              label: 'Letra D — prazo longo',
              detail: 'Alternativa com intervalo superior ao cobrado.',
              correct: 'Prazo longo — não condiz com os 2 minutos cobrados para código amarelo.',
            },
          ],
          footer_rule: 'Gabarito B — 2 minutos',
        },
      ],
    },
    danger: {},
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-4': {
    pack: {
      family: 'protocolo',
      guideline: 'Classificação SAMU — Tipo D exige médico obrigatoriamente na composição da equipe',
      roi_error: 'ambulancia_tipo_d_medico',
      cluster: 'SAMU — ambulância tipo D com médico',
      danger_footer: 'Gabarito D — tipo D médico',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Ambulância — tipo D',
          meta: slideMeta,
          items: [
            {
              label: 'Comando',
              detail: 'Qual tipo de ambulância obrigatoriamente inclui médico na equipe?',
              icon: 'Stethoscope',
            },
            {
              label: 'Tipo D',
              detail: 'Suporte avançado — médico integrante obrigatório.',
              icon: 'Ambulance',
            },
            {
              label: '× Tipo A',
              detail: 'Transporte/remoção simples — sem médico fixo.',
              icon: 'XCircle',
            },
            {
              label: '× Tipo B',
              detail: 'Suporte básico — enfermagem/técnico, sem médico obrigatório.',
              icon: 'HeartPulse',
            },
            {
              label: 'Pegadinha — tipo C',
              detail: 'Resgate/salvamento — perfil distinto do avançado com médico.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'Ambulância que obrigatoriamente exige médico na equipe — qual tipo?',
            'A Tipo A — eliminar — transporte simples.',
            'B Tipo B — eliminar — suporte básico sem médico fixo.',
            'C Tipo C — eliminar — resgate/salvamento, não suporte avançado com médico.',
            'D Tipo D — suporte avançado com médico obrigatório.',
            'Marcar D.',
            'Fixação: médico na equipe = tipo D nesta classificação.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Ambulâncias — decore',
          meta: slideMeta,
          content: 'TIPO D — MÉDICO OBRIGATÓRIO',
          rows: AMBULANCIA_TIPO_D_MEDICO,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Tipo A é remoção/transporte simples — não exige médico na composição da equipe.',
      B: 'Tipo B é suporte básico — equipe enfermagem/técnico sem médico obrigatório.',
      C: 'Tipo C é resgate com equipamentos de salvamento — perfil distinto do avançado tipo D.',
    },
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-5': {
    pack: {
      family: 'protocolo',
      guideline:
        'TARM — anotar dados básicos do chamado e prestar informações gerais; sem medicar, operar ou conduzir transporte',
      roi_error: 'tarm_dados_chamado',
      cluster: 'SAMU — atribuições TARM',
      danger_footer: 'Gabarito D — anotar e informar',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TARM — papel',
          meta: slideMeta,
          items: [
            {
              label: 'TARM',
              detail: 'Técnico Auxiliar em Regulação Médica — apoio à central SAMU/CRMU.',
              icon: 'Headset',
            },
            {
              label: 'Função real',
              detail: 'Registrar dados do chamado · orientar informações gerais ao solicitante.',
              icon: 'ClipboardList',
            },
            {
              label: 'Pegadinha — medicar',
              detail: 'Administrar medicações — papel da equipe móvel/hospital.',
              icon: 'Pill',
            },
            {
              label: 'Pegadinha — cirurgia',
              detail: 'Procedimento cirúrgico — competência médica.',
              icon: 'Scissors',
            },
            {
              label: 'Pegadinha — condução',
              detail: 'Transporte ao hospital — condutor ou equipe móvel.',
              icon: 'Car',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'TARM — principal responsabilidade durante atendimento de emergência?',
            'A administrar medicações — eliminar — ultrapassa escopo do TARM.',
            'B procedimentos cirúrgicos — eliminar — competência médica.',
            'C conduzir transporte — eliminar — motorista/equipe móvel.',
            'D anotar dados básicos do chamado e prestar informações gerais.',
            'Marcar D.',
            'Fixação: TARM registra · informa · apoia regulação — não executa cuidado invasivo.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'TARM — decore',
          meta: slideMeta,
          content: 'TARM — ATRIBUIÇÕES',
          rows: TARM_PAPEIS,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Administrar medicações aos pacientes é função da equipe móvel ou hospital — não do TARM na central.',
      B: 'Realizar procedimentos cirúrgicos de emergência excede o escopo do técnico auxiliar em regulação.',
      C: 'Conduzir transporte ao hospital é atribuição do condutor ou equipe móvel, não do TARM telefônico.',
    },
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-8': {
    pack: {
      family: 'conceito',
      guideline:
        'APH — método START classifica vítimas por gravidade, priorizando cuidados conforme necessidade e chances de sobrevivência',
      roi_error: 'aph_start_triagem',
      cluster: 'APH — triagem START em massa',
      danger_footer: 'Gabarito D — priorizar por gravidade',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'APH — START',
          meta: slideMeta,
          items: [
            {
              label: 'APH',
              detail: 'Atendimento antes do hospital — urgência e emergência no local.',
              icon: 'Ambulance',
            },
            {
              label: 'Triagem',
              detail: 'Classificar vítimas por gravidade — múltiplas vítimas ou desastre.',
              icon: 'Users',
            },
            {
              label: 'START',
              detail: 'Simple Triage And Rapid Treatment — cores e priorização rápida.',
              icon: 'Target',
            },
            {
              label: 'Pegadinha — câncer',
              detail: 'Rastreio populacional de neoplasia — não triagem de emergência.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Pegadinha — pré-natal',
              detail: 'Rastreio fetal — contexto obstétrico, não desastre.',
              icon: 'Ban',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'APH — método START responsável por quê?',
            'A detectar câncer precoce — eliminar — rastreio populacional.',
            'B problemas fetais na gravidez — eliminar — pré-natal.',
            'C sintomas de doença específica — eliminar — vigilância, não START.',
            'D escolher vítimas por necessidade de cuidados e chances de sobrevivência.',
            'Marcar D.',
            'Fixação: START = triagem rápida · priorizar quem salva mais vidas.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'START — decore',
          meta: slideMeta,
          content: 'TRIAGEM START',
          rows: START_TRIAGEM,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Detectar câncer em estágios iniciais é rastreio populacional — não função do START no APH.',
      B: 'Identificar problemas fetais na gravidez é vigilância pré-natal — fora do escopo START.',
      C: 'Detectar sintomas de doença específica é vigilância epidemiológica — não triagem de massa.',
    },
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-3': {
    pack: {
      family: 'protocolo',
      guideline:
        'TCE pós-queda — aferir sinais vitais · pupilas · estabilizar coluna · reavaliar Glasgow seriadamente; não dispensar escala só porque responde verbalmente',
      roi_error: 'tce_glasgow_seriado',
      cluster: 'TCE queda — conduta que NÃO condiz (1 hit trauma)',
      danger_footer: 'Gabarito D — não dispensar Glasgow',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'TCE — queda andaime',
          meta: slideMeta,
          items: [
            {
              label: 'Cenário',
              detail:
                'Luiz, pedreiro — queda do andaime (~8 m) · sem capacete · cabeça na viga de cimento · confuso · dor occipital · colegas socorreram · SAMU · protocolo TCE.',
              icon: 'HardHat',
            },
            {
              label: 'Condutas reais',
              detail: 'Sinais vitais · pupilas · estabilização cervical manual.',
              icon: 'Shield',
            },
            {
              label: 'Glasgow seriado',
              detail: 'Reavaliar consciência mesmo com resposta verbal inicial.',
              icon: 'Brain',
            },
            {
              label: 'Pegadinha — dispensar ECG',
              detail: 'Recusar Glasgow seriado porque vítima responde verbalmente.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Risco',
              detail: 'Rebaixamento tardio após TCE — monitorização contínua.',
              icon: 'Activity',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: slideMeta,
          steps: [
            'Luiz caiu do andaime · trauma cranioencefálico — qual conduta NÃO condiz com protocolo?',
            'A aferir sinais vitais — conduta correta — eliminar.',
            'B avaliar reação pupilar — conduta correta — eliminar.',
            'C estabilização manual da coluna cervical — conduta correta — eliminar.',
            'D recusar Glasgow seriado só porque responde verbalmente — NÃO condiz.',
            'Marcar D.',
            'Fixação: TCE exige reavaliação neurológica seriada — resposta verbal não exclui monitorização.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'TCE — decore cuidados',
          meta: slideMeta,
          content: 'TCE — PROTOCOLO SAMU',
          rows: TCE_QUEDA_PROTOCOLO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: slideMeta,
          content: 'PEGADINHAS — dispensar glasgow seriado',
          items: [
            {
              label: 'Letra A — sinais vitais',
              detail: 'Aferição de PA · FC · FR · SpO₂ no TCE.',
              correct: 'Conduta correta do protocolo — não é a que NÃO condiz.',
            },
            {
              label: 'Letra B — pupilas',
              detail: 'Avaliar tamanho · simetria · reatividade pupilar.',
              correct: 'Parte da avaliação neurológica — conduta compatível com TCE.',
            },
            {
              label: 'Letra C — coluna cervical',
              detail: 'Estabilização manual até imobilização adequada.',
              correct: 'Proteção medular em trauma — conduta correta, não a exceção.',
            },
            {
              label: 'Letra D — recusar Glasgow',
              detail: 'Dispensar avaliação seriada porque vítima responde verbalmente.',
              correct:
                'NÃO condiz — TCE exige reavaliação seriada da escala de Glasgow mesmo com resposta verbal inicial.',
            },
          ],
          footer_rule: 'Gabarito D — Glasgow seriado',
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, { pack, danger }] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const q = readQuestaoJson(path) as Q;
    const slides = finalizeSlides(slug, q, pack, { [slug]: danger });
    const out = {
      meta: metaBase(
        q,
        pack.family,
        pack.guideline,
        slug,
        pack.roi_error,
        pack.cluster,
        REVIEWER,
      ),
      question_data: q.question_data,
      reverse_study_slides: slides,
      modulo_slug: q.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g42] OK ${slug}`);
  }

  console.log(`[handcraft:urgencias-g42] total=${ok}`);
}

main();
