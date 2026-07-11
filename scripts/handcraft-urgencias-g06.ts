#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g06 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g06.ts
 *   npx tsx scripts/handcraft-urgencias-g06.ts
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

const LOTE = 'urgencias-g06';
const REVIEWER = 'handcraft-urgencias-g06';

type PackExt = Pack & { exam_vs_current?: string };

const SPECS: Record<string, PackExt> = {
  'unifil-enfermagem-urgencias-e-emergencias-1777104012755-2': {
    family: 'protocolo',
    guideline: 'RCP adulto — dois socorristas sem via aérea avançada: 30 compressões : 2 ventilações',
    roi_error: 'rcp_30_2_dois_socorristas',
    cluster: 'Proporção compressão-ventilação — dois socorristas',
    danger_footer: '30:2 sem dispositivo avançado — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: '30:2 — dupla',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Dois socorristas treinados — sem via aérea avançada disponível.',
            icon: 'HeartPulse',
          },
          {
            label: 'Proporção correta',
            detail: '30 compressões torácicas para cada 2 ventilações.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — proporção errada',
            detail: 'Quinze compressões para duas ventilações — proporção inadequada para adulto com dois socorristas.',
            icon: 'Hash',
          },
          {
            label: 'C-A-B',
            detail: 'Compressão antes de ventilação no adulto em PCR.',
            icon: 'ArrowRight',
          },
        ],
        footer_rule: 'Decore: 30:2 adulto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Dois socorristas — sem via aérea avançada: proporção RCP?',
          'Eliminar 15 compressões para 2 ventilações (A).',
          'Eliminar compressões ininterruptas com ventilação isolada (C).',
          'Eliminar só frequência sem ventilação coordenada (D).',
          '30 compressões para 2 ventilações.',
          'Marcar B.',
        ],
        footer_rule: 'Coordenar 30:2 — não ventilar a cada seis segundos isolado',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — 30:2',
        rows: rcpParamRows(),
        footer_rule: 'Dupla extra-hospitalar ou hospitalar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — rcp 30 2 dois socorristas',
        items: [
          {
            label: 'Letra A — quinze para duas',
            detail: 'Quinze compressões para duas ventilações — proporção errada no adulto.',
            correct: 'Adulto sem via avançada: 30 compressões para 2 ventilações.',
          },
          {
            label: 'Letra C — compressões ininterruptas',
            detail: 'Ventilação desacoplada do ciclo padrão de compressões.',
            correct: 'Coordenar 30:2 — não ventilar a cada seis segundos isolado.',
          },
          {
            label: 'Letra D — só frequência',
            detail: 'Cita compressões por minuto sem relação com ventilações.',
            correct: 'Proporção fixa 30:2 quando dois socorristas e sem via avançada.',
          },
        ],
        footer_rule: 'Gabarito B — 30:2',
      },
    ],
  },
  'univali-enfermagem-processo-de-enfermagem-1780010905023-6': {
    family: 'protocolo',
    guideline: 'RCP — verificar responsividade, acionar ajuda, posicionar e iniciar compressões + ventilação',
    roi_error: 'rcp_sequencia_hospitalar',
    cluster: 'Sequência essencial da RCP no ambiente hospitalar',
    danger_footer: 'Responsividade → ajuda → compressões — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sequência RCP',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Reconhecimento imediato — cada segundo conta na sobrevida.',
            icon: 'HeartPulse',
          },
          {
            label: 'Responsividade',
            detail: 'Verificar inconsciência — acionar equipe de emergência.',
            icon: 'User',
          },
          {
            label: 'Compressões + ventilação',
            detail: 'Compressões profundas e rápidas alternadas com ventilação artificial.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — esperar médico',
            detail: 'Aguardar médico ou só ventilar sem compressões torácicas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Não aguardar — iniciar RCP já',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR no hospital — sequência correta da RCP?',
          'Eliminar interromper RCP a cada pulso sem indicação (A).',
          'Eliminar aguardar médico antes de comprimir (B).',
          'Eliminar ventilação sem compressões (D).',
          'Verificar responsividade, chamar ajuda, posicionar, comprimir e ventilar.',
          'Marcar C.',
        ],
        footer_rule: 'Equipe + compressões imediatas',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RCP — HOSPITAL',
        rows: [
          { label: '1', value: 'Verificar responsividade', badge: 'hot' },
          { label: '2', value: 'Chamar ajuda / acionar equipe', badge: 'ok' },
          { label: '3', value: 'Posicionar paciente — superfície firme', badge: 'ok' },
          { label: '4', value: 'Compressões 100–120/min + ventilação', badge: 'warn' },
        ],
        footer_rule: 'DEA quando disponível',
      },
      null as unknown,
    ],
  },
  'unesc-enfermagem-urgencias-e-emergencias-1780001220945-6': {
    family: 'conceito',
    guideline: 'Parada cardíaca — ausência de pulso carotídeo é sinal mais confiável',
    roi_error: 'pcr_sinal_pulso_carotideo',
    cluster: 'Reconhecimento — pulso carotídeo na parada cardíaca',
    danger_footer: 'Pulso carotídeo ausente — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reconhecer parada',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardíaca',
            detail: 'Ausência de circulação efetiva — iniciar RCP e compressões torácicas imediatamente.',
            icon: 'HeartOff',
          },
          {
            label: 'Pulso carotídeo',
            detail: 'Sinal mais confiável para identificar parada cardíaca.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — síncope ou sonolência',
            detail: 'Confundir síncope, sonolência ou hipotensão com parada cardíaca — sem checar pulso carotídeo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Apneia',
            detail: 'Associada à inconsciência — reforça necessidade de SBV.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Sem pulso central → comprimir',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Sinal mais confiável de parada cardíaca?',
          'Eliminar febre (A).',
          'Eliminar sonolência (C).',
          'Eliminar síncope isolada (D).',
          'Eliminar hipotensão sem ausência de pulso (E).',
          'Ausência de pulso carotídeo — marcar B.',
        ],
        footer_rule: 'Checar pulso central em até ~10 s',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINAIS DE PCR',
        rows: [
          { label: 'Confiável', value: 'Ausência de pulso carotídeo', badge: 'hot' },
          { label: 'Associados', value: 'Inconsciência + apneia ou gasping', badge: 'ok' },
          { label: 'RCP', value: 'Compressões 100–120/min se pulso ausente', badge: 'warn' },
          { label: 'Insuficientes', value: 'Febre · sonolência · síncope isolada', badge: 'warn' },
        ],
        footer_rule: 'Pulso ausente → RCP',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — pcr sinal pulso carotideo',
        items: [
          {
            label: 'Letra C — sonolência',
            detail: 'Sonolência isolada não confirma parada cardíaca.',
            correct: 'Checar pulso carotídeo — sonolência não substitui ausência de pulso.',
          },
          {
            label: 'Letra D — síncope',
            detail: 'Síncope pode ocorrer com pulso presente.',
            correct: 'Ausência de pulso carotídeo é o sinal mais confiável de parada cardíaca.',
          },
          {
            label: 'Letra E — hipotensão',
            detail: 'Hipotensão não identifica parada cardíaca sem checar pulso.',
            correct: 'Confirmar ausência de pulso carotídeo antes de iniciar RCP.',
          },
          {
            label: 'Letra A — febre',
            detail: 'Febre não é critério de parada cardíaca.',
            correct: 'Pulso carotídeo ausente — sinal mais confiável nesta questão.',
          },
        ],
        footer_rule: 'Gabarito B — pulso carotídeo ausente',
      },
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104000896-0': {
    family: 'protocolo',
    guideline: 'RCP alta qualidade — 5–6 cm profundidade, retorno total do tórax, 100–120/min',
    roi_error: 'rcp_qualidade_5_6cm',
    cluster: 'Qualidade da RCP — profundidade, retorno e frequência',
    danger_footer: '5–6 cm · retorno total · 100–120/min — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP de qualidade',
        meta: slideMeta,
        items: [
          {
            label: 'Profundidade',
            detail: 'Comprimir esterno entre 5 e 6 cm no adulto.',
            icon: 'ArrowDown',
          },
          {
            label: 'Retorno do tórax',
            detail: 'Permitir retorno total após cada compressão torácica.',
            icon: 'MoveVertical',
          },
          {
            label: 'Frequência',
            detail: '100 a 120 compressões por minuto.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — rasa ou lenta',
            detail: 'Profundidade de 4 cm ou frequência de 80–100/min.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Qualidade > velocidade isolada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR adulto — quando a RCP é de alta qualidade?',
          'Eliminar ventilar antes de comprimir em excesso (B).',
          'Eliminar desfibrilar antes de RCP com profundidade rasa (C).',
          'Eliminar 4–5 cm e frequência lenta (D).',
          '5–6 cm, retorno total, 100–120 compressões/min.',
          'Marcar A.',
        ],
        footer_rule: 'Soltar o tórax a cada compressão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — QUALIDADE',
        rows: rcpParamRows([
          { label: 'Retorno', value: 'Tórax retorna completamente entre compressões', badge: 'hot' },
        ]),
        footer_rule: 'Alta qualidade salva cérebro e coração',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — rcp qualidade 5 6cm',
        items: [
          {
            label: 'Letra B — ventilar antes de comprimir',
            detail: 'Inicia com duas respirações e compressões excessivamente rápidas.',
            correct: 'C-A-B no adulto — compressões torácicas primeiro.',
          },
          {
            label: 'Letra C — DEA antes de RCP rasa',
            detail: 'Desfibrilação antes de compressões de qualidade inadequada.',
            correct: 'RCP de alta qualidade antes e durante uso do DEA.',
          },
          {
            label: 'Letra D — profundidade e ritmo lentos',
            detail: 'Quatro a cinco cm com frequência abaixo do alvo.',
            correct: 'Cinco a seis cm e 100–120 compressões por minuto.',
          },
          {
            label: 'Letra E — sem retorno do tórax',
            detail: 'Monitor e acesso venoso antes de compressões com retorno incompleto.',
            correct: 'Retorno total do tórax é parte da alta qualidade.',
          },
        ],
        footer_rule: 'Gabarito A — 5–6 cm · 100–120/min',
      },
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777104063550-0': {
    family: 'protocolo',
    guideline: 'PCR adulto UBS — compressões 100–120/min; gabarito prova enfatiza profundidade e frequência',
    roi_error: 'ubs_pcr_primeiros_socorros',
    cluster: 'Primeiros socorros — parada cardiorrespiratória na UBS',
    exam_vs_current:
      'Gabarito C cita 1/3 diâmetro AP — AHA adulto recomenda 5–6 cm; slides seguem gabarito da prova.',
    danger_footer: 'Comprimir já — frequência 100–120/min — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR na UBS',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Adulto sem trauma — iniciar compressões torácicas imediatas.',
            icon: 'HeartPulse',
          },
          {
            label: 'Frequência',
            detail: '100 a 120 compressões por minuto.',
            icon: 'Gauge',
          },
          {
            label: 'Profundidade',
            detail: 'Compressão vigorosa com retorno do tórax — gabarito da prova.',
            icon: 'ArrowDown',
          },
          {
            label: 'Pegadinha — aguardar médico',
            detail: 'Esperar confirmação médica ou proporção ventilação/compressão inventada.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Não aguardar — SBV imediato',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR adulto na UBS — primeiros socorros corretos?',
          'Eliminar aguardar médico para confirmar ausência de pulso (A).',
          'Eliminar proporção absurda de ventilações (B).',
          'Eliminar desfibrilar ritmos não desfibriláveis (D).',
          'Eliminar compressões lentas sem retorno do tórax (E).',
          'Compressão vigorosa com frequência 100–120/min — marcar C.',
        ],
        footer_rule: 'Acionar SAMU e comprimir',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'UBS — PCR ADULTO',
        rows: rcpParamRows(),
        footer_rule: 'Gabarito C desta prova — frequência 100–120/min',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ubs pcr primeiros socorros',
        items: [
          {
            label: 'Letra A — aguardar médico',
            detail: 'Posterga ressuscitação cardiopulmonar aguardando confirmação.',
            correct: 'Iniciar RCP imediata — não esperar médico para comprimir.',
          },
          {
            label: 'Letra B — proporção ventilação absurda',
            detail: 'Quatro ventilações para cento e vinte compressões — inventado.',
            correct: 'Adulto: 30 compressões para 2 ventilações quando aplicável.',
          },
          {
            label: 'Letra D — ritmos não desfibriláveis',
            detail: 'Inclui fibrilação atrial e AESP como alvo de desfibrilação.',
            correct: 'Desfibrilar FV/TVSP — não fibrilação atrial.',
          },
          {
            label: 'Letra E — compressões lentas',
            detail: 'Frequência abaixo do alvo sem retorno do tórax.',
            correct: '100–120/min com retorno completo do tórax.',
          },
        ],
        footer_rule: 'Gabarito C — comprimir forte e rápido',
      },
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-1': {
    family: 'protocolo',
    guideline: 'SBV no trauma — 1º passo: checar responsividade e respiração (segurança da cena antes)',
    roi_error: 'sbv_trauma_primeiro_passo',
    cluster: 'Atendimento pré-hospitalar — primeiro passo do SBV',
    danger_footer: 'Responsividade + respiração primeiro — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SBV — cena de trauma',
        meta: slideMeta,
        items: [
          {
            label: 'Segurança da cena',
            detail: 'Rodovia — garantir ambiente seguro antes de aproximar da vítima.',
            icon: 'Shield',
          },
          {
            label: 'Responsividade',
            detail: 'Tocar ombros e chamar em voz alta — vítima não verbaliza.',
            icon: 'User',
          },
          {
            label: 'Respiração',
            detail: 'Avaliar presença de respiração efetiva após checar consciência.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — pulso primeiro',
            detail: 'Checar pulso ou fraturas antes de responsividade e respiração.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Consciência → respiração → então pulso/PCR',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Acidente de trânsito — primeiro passo do SBV?',
          'Eliminar checar pulso antes de consciência (A).',
          'Eliminar procurar fraturas como 1º passo (B).',
          'Eliminar via aérea antes de responsividade (C).',
          'Checar responsividade e presença de respiração.',
          'Marcar D.',
        ],
        footer_rule: 'ABCDE começa por A — via aérea depois',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: '1º PASSO — SBV',
        rows: [
          { label: '1', value: 'Segurança da cena', badge: 'hot' },
          { label: '2', value: 'Responsividade (estimular e chamar)', badge: 'ok' },
          { label: '3', value: 'Respiração — ver, ouvir, sentir', badge: 'ok' },
          { label: '4', value: 'Se PCR: compressões 100–120/min', badge: 'warn' },
        ],
        footer_rule: 'SAMU — avaliação primária sistemática',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — sbv trauma primeiro passo',
        items: [
          {
            label: 'Letra A — pulso primeiro',
            detail: 'Checar pulso antes de responsividade e respiração.',
            correct: 'Primeiro: responsividade e respiração — depois pulso se indicado.',
          },
          {
            label: 'Letra B — fraturas primeiro',
            detail: 'Procurar fraturas como passo inicial do SBV.',
            correct: 'Responsividade e respiração vêm antes da busca de lesões.',
          },
          {
            label: 'Letra C — via aérea antes',
            detail: 'Constatar via aérea antes de estimular a vítima.',
            correct: 'Checar responsividade e respiração — não inverter a sequência do SBV.',
          },
        ],
        footer_rule: 'Gabarito D — responsividade + respiração',
      },
    ],
  },
  'vunesp-enfermagem-urgencias-e-emergencias-1777103994618-8': {
    family: 'protocolo',
    guideline: 'Técnico de enfermagem — pode utilizar DEA na parada cardiorrespiratória',
    roi_error: 'tecnico_dea_atribuicao',
    cluster: 'Atribuição do técnico — desfibrilador externo automático',
    danger_footer: 'Técnico pode usar DEA — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DEA — técnico',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Desfibrilação precoce aumenta chance de sobrevida.',
            icon: 'HeartPulse',
          },
          {
            label: 'DEA',
            detail: 'Desfibrilador externo automático — técnico pode operar.',
            icon: 'Zap',
          },
          {
            label: 'RCP simultânea',
            detail: 'Compressões torácicas enquanto prepara o aparelho.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — exclusão do DEA',
            detail: 'Reservar desfibrilador externo automático só ao médico — atrasa desfibrilação na parada cardiorrespiratória.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ligar DEA assim que disponível',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atribuição do técnico de enfermagem na equipe — PCR?',
          'Eliminar atribuições fora do escopo do técnico nas alternativas erradas.',
          'Correto: utilização do desfibrilador externo automático (DEA).',
          'Marcar B.',
        ],
        footer_rule: 'SBV inclui DEA para leigos e técnicos',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DEA — EQUIPE',
        rows: [
          { label: 'Técnico', value: 'Pode aplicar DEA conforme protocolo', badge: 'hot' },
          { label: 'RCP', value: 'Compressões 100–120/min até DEA pronto', badge: 'ok' },
          { label: 'Ritmos', value: 'FV/TVSP — desfibrilação precoce', badge: 'warn' },
        ],
        footer_rule: 'Não esperar equipe avançada para DEA',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — tecnico dea atribuicao',
        items: [
          {
            label: 'Letra A — coleta citológica',
            detail: 'Coleta para rastreamento — não é uso de desfibrilador na PCR.',
            correct: 'Técnico pode utilizar DEA na parada cardiorrespiratória — gabarito B.',
          },
          {
            label: 'Letra C — sondagem vesical',
            detail: 'Procedimento invasivo distinto da desfibrilação na PCR.',
            correct: 'Atribuição correta: desfibrilador externo automático pelo técnico.',
          },
          {
            label: 'Letra D — sonda nasogástrica',
            detail: 'Troca de sonda para alimentação — fora do escopo do DEA.',
            correct: 'Reservar DEA só ao médico atrasa desfibrilação — técnico pode operar.',
          },
          {
            label: 'Letra E — saúde mental',
            detail: 'Grupos terapêuticos — ramo diferente da parada cardiorrespiratória.',
            correct: 'Desfibrilador externo automático é atribuição do técnico nesta questão.',
          },
        ],
        footer_rule: 'Gabarito B — técnico + DEA',
      },
    ],
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-2': {
    family: 'protocolo',
    guideline: 'APH — reservatório de oxigênio no Ambu otimiza ventilação na PCR',
    roi_error: 'ambu_reservatorio_o2',
    cluster: 'Ventilação manual — balão autoinflável com reservatório',
    danger_footer: 'Reservatório de O2 no Ambu — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ambu na PCR',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Ventilação de resgate associada às compressões torácicas.',
            icon: 'HeartPulse',
          },
          {
            label: 'Balão autoinflável',
            detail: 'Ambu — não depende de eletricidade para funcionar.',
            icon: 'Wind',
          },
          {
            label: 'Reservatório de O2',
            detail: 'Acoplado ao Ambu — aumenta fração inspirada de oxigênio.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — ventilação na PCR',
            detail: 'Máscara sem vedação ou Ambu sem reservatório de oxigênio — ventilação ineficaz nas compressões da parada cardiorrespiratória.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vedar máscara + O2 suplementar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'APH — otimizar oxigênio na parada cardiorrespiratória com Ambu?',
          'Eliminar válvula que impede oxigênio (A).',
          'Eliminar máscara sem vedação (B).',
          'Eliminar necessidade de eletricidade (C).',
          'Reservatório de oxigênio acoplado otimiza ventilação manual.',
          'Marcar D.',
        ],
        footer_rule: 'Comprimir primeiro — ventilar com O2',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AMBU + O2',
        rows: [
          { label: 'Ambu', value: 'Ventilação manual na RCP', badge: 'hot' },
          { label: 'Reservatório', value: 'Oxigênio acoplado — maior FiO2', badge: 'ok' },
          { label: 'Vedação', value: 'Máscara bem adaptada ao rosto', badge: 'warn' },
          { label: 'RCP', value: '30:2 ou compressões contínuas com ventilação', badge: 'info' },
        ],
        footer_rule: 'Hiperventilar prejudica — ventilar devagar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ambu reservatorio o2',
        items: [
          {
            label: 'Letra A — válvula unidirecional',
            detail: 'Achar que a válvula unidirecional impede oxigênio no Ambu.',
            correct: 'Reservatório de oxigênio acoplado otimiza a ventilação na parada cardiorrespiratória.',
          },
          {
            label: 'Letra B — máscara sem vedação',
            detail: 'Dispensar vedação da máscara na ventilação com Ambu.',
            correct: 'Vedar a máscara — compressões na PCR exigem ventilação eficaz com oxigênio.',
          },
          {
            label: 'Letra C — eletricidade',
            detail: 'Ambu manual não depende de eletricidade para funcionar.',
            correct: 'Acoplar reservatório de oxigênio para otimizar FiO2 na ventilação manual.',
          },
        ],
        footer_rule: 'Gabarito D — reservatório de O2',
      },
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'univali-enfermagem-processo-de-enfermagem-1780010905023-6': {
    A: 'Interromper RCP a cada pulso sem necessidade — reduz perfusão.',
    B: 'Aguardar médico atrasa compressões torácicas na parada cardiorrespiratória.',
    D: 'Ventilação sem compressões — insuficiente na PCR cardíaca.',
  },
};

function finalizeSlides(slug: string, q: Q, pack: PackExt): unknown[] {
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
    const meta = metaBase(
      raw,
      pack.family,
      pack.guideline,
      slug,
      pack.roi_error,
      pack.cluster,
      REVIEWER,
    );
    if (pack.exam_vs_current) {
      (meta.content_review as Record<string, unknown>).exam_vs_current = pack.exam_vs_current;
    }
    const out = {
      meta,
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g06] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g06] total=${ok}`);
}

main();
