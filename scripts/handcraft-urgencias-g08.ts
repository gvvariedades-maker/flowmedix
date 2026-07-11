#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g08 (8 slugs · urgencias_rcp_sbv).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  metaBase,
  rcpParamRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpGolden';

const LOTE = 'urgencias-g08';
const REVIEWER = 'handcraft-urgencias-g08';

type Family = Pack['family'] | 'certo_errado';
type PackExt = Omit<Pack, 'family'> & { family: Family };

const SPECS: Record<string, PackExt> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-3': {
    family: 'protocolo',
    guideline: 'SBV pré-SAV — evitar hiperventilação; ventilação controlada com bolsa-válvula-máscara',
    roi_error: 'pcr_hiperventilacao_incorreta',
    cluster: 'INCORRETA — ventilação na parada cardiorrespiratória',
    danger_footer: 'Ventilação rápida contínua é a INCORRETA — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ventilação na PCR',
        meta: slideMeta,
        items: [
          {
            label: 'Manejo inicial — adultos',
            detail: 'PCR em adultos no período prévio à chegada do suporte avançado de vida — ventilação criteriosa.',
            icon: 'HeartPulse',
          },
          {
            label: 'Princípios fisiológicos',
            detail: 'Diretrizes atuais de SBV e RCP — erros na ventilação comprometem a eficácia da ressuscitação.',
            icon: 'BookOpen',
          },
          {
            label: 'Hiperventilação na PCR',
            detail: 'Parada cardiorrespiratória — compressões torácicas e ventilação SBV coordenadas no manejo inicial.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — ventilação rápida',
            detail: 'Bolsa-válvula-máscara contínua e rápida para maximizar oxigenação tecidual — conduta INCORRETA.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ventilar devagar — não hiperventilar na RCP',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Manejo inicial da PCR em adultos — período prévio ao suporte avançado de vida: qual INCORRETA?',
          'Ventilação criteriosa com bolsa-válvula-máscara conforme princípios fisiológicos da RCP.',
          'A: hiperventilação eleva pressão intratorácica — verdadeiro.',
          'B: prejudica retorno venoso — verdadeiro.',
          'C: reduz débito das compressões — verdadeiro.',
          'D: ventilar rápido e contínuo para oxigenar — FALSO (gabarito).',
          'E: excesso compromete perfusão cerebral e coronariana — verdadeiro.',
          'Marcar D.',
        ],
        footer_rule: 'Perfusão cerebral e coronariana sofrem com excesso de ar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VENTILAÇÃO — SBV',
        rows: [
          { label: 'Contexto', value: 'Adultos · pré-SAV · diretrizes SBV atuais', badge: 'hot' },
          { label: 'Proporção', value: '30:2 — compressões torácicas e ventilação controlada', badge: 'ok' },
          { label: 'Evitar', value: 'Hiperventilação — pressão intratorácica alta', badge: 'warn' },
        ],
        footer_rule: 'Oxigenar sem sacrificar compressões',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — pcr hiperventilacao incorreta',
        items: [
          {
            label: 'Letra A — pressão intratorácica',
            detail: 'Afirmativa verdadeira sobre fisiologia da hiperventilação.',
            correct: 'Não é a INCORRETA — hiperventilação realmente eleva pressão intratorácica.',
          },
          {
            label: 'Letra B — retorno venoso',
            detail: 'Afirmativa verdadeira — mecanismo da hiperventilação na PCR.',
            correct: 'Conduta correta como conceito — não é o gabarito INCORRETA.',
          },
          {
            label: 'Letra C — débito cardíaco',
            detail: 'Ventilação excessiva reduz débito gerado pelas compressões.',
            correct: 'Afirmativa verdadeira — não é a alternativa INCORRETA da prova.',
          },
          {
            label: 'Letra D — ventilação rápida contínua',
            detail: 'Pegadinha: bolsa-válvula-máscara contínua e rápida para maximizar oxigenação tecidual.',
            correct: 'INCORRETA — hiperventilação compromete perfusão; ventilar de forma criteriosa na RCP.',
          },
        ],
        footer_rule: 'Gabarito D — não ventilar rápido demais',
      },
    ],
  },
  'com-exam-pref-bauru-enfermagem-urgencias-e-emergencias-1777104056718-4': {
    family: 'protocolo',
    guideline: 'Qualidade RCP — comprimir forte e rápido; 30:2; trocar a cada 2 min; não hiperventilar',
    roi_error: 'qualidade_rcp_incorreta',
    cluster: 'INCORRETA — qualidade da ressuscitação cardiopulmonar',
    danger_footer: 'Ventilação excessiva é INCORRETA — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Qualidade RCP',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Qualidade das compressões torácicas determina sobrevida após PCR.',
            icon: 'HeartPulse',
          },
          {
            label: 'Compressões',
            detail: 'Forte e rápido — proporção trinta para duas sem via aérea avançada.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — hiperventilar',
            detail: 'Manter ventilação excessiva como conduta correta — erro da prova.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Troca de socorrista',
            detail: 'Alternar compressores a cada dois minutos ou antes se cansar.',
            icon: 'Users',
          },
        ],
        footer_rule: 'Alta qualidade = perfusão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Qualidade da RCP adulta — assinale a INCORRETA.',
          'A: comprimir com força e rápido — conduta correta.',
          'C: alternar compressores ~a cada 2 min — correto.',
          'D: proporção trinta para duas sem via avançada — correto.',
          'B: manter ventilação excessiva — INCORRETA.',
          'Marcar B.',
        ],
        footer_rule: 'Hiperventilação prejudica retorno venoso',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — QUALIDADE',
        rows: rcpParamRows(),
        footer_rule: 'Não hiperventilar na parada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — qualidade rcp incorreta',
        items: [
          {
            label: 'Letra A — comprimir forte',
            detail: 'Compressões vigorosas e rápidas no adulto.',
            correct: 'Afirmativa correta — não é a INCORRETA desta questão.',
          },
          {
            label: 'Letra B — ventilação excessiva',
            detail: 'Manter ventilação excessiva durante a RCP.',
            correct: 'INCORRETA — hiperventilação reduz eficácia das compressões torácicas.',
          },
          {
            label: 'Letra C — trocar socorrista',
            detail: 'Alternar responsável pelas compressões a cada dois minutos.',
            correct: 'Conduta correta — não é o gabarito INCORRETA.',
          },
          {
            label: 'Letra D — proporção trinta para duas',
            detail: 'Relação compressão-ventilação sem via aérea avançada.',
            correct: 'Afirmativa verdadeira — adulto em SBV: trinta para duas ventilações.',
          },
        ],
        footer_rule: 'Gabarito B — ventilação excessiva',
      },
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-0': {
    family: 'protocolo',
    guideline: 'SBV/AHA — cadeia de sobrevivência; após ROSC encaminhar para serviço de referência',
    roi_error: 'pcr_rosc_encaminhamento',
    cluster: 'INCORRETA — protocolo SBV na parada cardiorrespiratória',
    danger_footer: 'Liberar sem encaminhar após ROSC é INCORRETA — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia SBV',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Chance de sobrevida cai a cada minuto sem SBV — iniciar compressões já.',
            icon: 'HeartPulse',
          },
          {
            label: 'Posicionamento',
            detail: 'Decúbito dorsal em superfície plana, rígida e seca.',
            icon: 'Bed',
          },
          {
            label: 'Pegadinha — alta após ROSC',
            detail: 'Liberar paciente após retorno da circulação sem encaminhamento.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Avaliação',
            detail: 'Checar respiração e pulso — iniciar RCP se apneia.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'ROSC não encerra cuidado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR — afirmativa INCORRETA segundo AHA/SBV?',
          'A: checar respiração e pulso — correto.',
          'B: decúbito dorsal em superfície rígida — correto.',
          'C: iniciar RCP se respiração ausente — correto.',
          'D: liberar após ROSC sem encaminhar — INCORRETA.',
          'Marcar D.',
        ],
        footer_rule: 'Encaminhar após retorno da circulação',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CADEIA — SBV',
        rows: [
          { label: 'Reconhecer', value: 'PCR — pulso e respiração ausentes', badge: 'hot' },
          { label: 'RCP', value: 'Compressões 100–120/min + ventilação', badge: 'ok' },
          { label: 'Pós-ROSC', value: 'Monitorar e encaminhar ao serviço de referência', badge: 'warn' },
        ],
        footer_rule: 'Não dar alta imediata após ROSC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — pcr rosc encaminhamento',
        items: [
          {
            label: 'Letra A — respiração e pulso',
            detail: 'Checar respiração e pulso simultaneamente na avaliação.',
            correct: 'Afirmativa correta do protocolo — não é a INCORRETA.',
          },
          {
            label: 'Letra B — decúbito dorsal',
            detail: 'Superfície plana, rígida e seca para compressões.',
            correct: 'Conduta correta — não é o gabarito INCORRETA.',
          },
          {
            label: 'Letra C — iniciar RCP',
            detail: 'Manobras de ressuscitação se respiração ausente.',
            correct: 'Afirmativa verdadeira — não é a alternativa INCORRETA.',
          },
          {
            label: 'Letra D — liberar após ROSC',
            detail: 'Alta sem encaminhamento após retorno da circulação espontânea.',
            correct: 'INCORRETA — paciente precisa de encaminhamento e monitorização pós-ROSC.',
          },
        ],
        footer_rule: 'Gabarito D — encaminhar após ROSC',
      },
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104096594-7': {
    family: 'protocolo',
    guideline: 'PCR — inconsciência e apneia; detecção precoce; reanimação imediata',
    roi_error: 'pcr_falar_apos_parada',
    cluster: 'INCORRETA — reconhecimento da parada cardiorrespiratória',
    danger_footer: 'Falar após PCR é INCORRETA — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Reconhecer PCR',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Emergência máxima — prioridade sobre outras urgências; iniciar reanimação cardiopulmonar.',
            icon: 'HeartPulse',
          },
          {
            label: 'Suporte Básico de Vida',
            detail: 'Protocolos SBV capacitam a equipe para compressões torácicas imediatas na PCR.',
            icon: 'Activity',
          },
          {
            label: 'Protocolos',
            detail: 'Equipe treinada inicia reanimação cardiopulmonar rapidamente.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — falar após PCR',
            detail: 'Paciente consegue falar e pedir ajuda após parada cardiorrespiratória.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Sobrevida',
            detail: 'Detecção e tratamento precoce evitam sequelas neurológicas.',
            icon: 'Brain',
          },
        ],
        footer_rule: 'PCR = inconsciência + ausência de pulso',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR — afirmativa INCORRETA?',
          'B: protocolos facilitam atendimento — correto.',
          'C: equipe preparada para RCP imediata — correto.',
          'D: detecção precoce salva — correto.',
          'A: muitos pacientes falam após PCR — INCORRETA.',
          'Marcar A.',
        ],
        footer_rule: 'Parada = sem pulso efetivo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PCR — PRIORIDADE',
        rows: [
          { label: 'Emergência', value: 'Parada cardiorrespiratória — RCP imediata', badge: 'hot' },
          { label: 'Equipe', value: 'Protocolos e treinamento em SBV', badge: 'ok' },
          { label: 'Não é', value: 'Paciente verbalizando após PCR estabelecida', badge: 'warn' },
        ],
        footer_rule: 'Inconsciência na parada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — pcr falar apos parada',
        items: [
          {
            label: 'Letra A — falar após PCR',
            detail: 'Muitos pacientes falam e pedem ajuda após parada cardiorrespiratória.',
            correct: 'INCORRETA — PCR cursa com inconsciência e ausência de circulação efetiva.',
          },
          {
            label: 'Letra B — protocolos',
            detail: 'Organização por protocolos específicos facilita o tratamento.',
            correct: 'Afirmativa correta — não é a INCORRETA desta questão.',
          },
          {
            label: 'Letra C — RCP rápida',
            detail: 'Equipe preparada para reanimação cardiopulmonar imediata.',
            correct: 'Conduta correta — não é o gabarito INCORRETA.',
          },
          {
            label: 'Letra D — detecção precoce',
            detail: 'Tratamento precoce assegura sobrevida e reduz sequelas.',
            correct: 'Afirmativa verdadeira — não é a alternativa INCORRETA.',
          },
        ],
        footer_rule: 'Gabarito A — não falar na PCR',
      },
    ],
  },
  'furb-enfermagem-urgencias-e-emergencias-1777104012755-6': {
    family: 'protocolo',
    guideline: 'RCP — decúbito dorsal em superfície firme; cabeça em leve extensão para ventilação',
    roi_error: 'rcp_posicao_decubito_dorsal',
    cluster: 'Posicionamento do paciente para compressões torácicas',
    danger_footer: 'Decúbito dorsal em superfície firme — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Posição na RCP',
        meta: slideMeta,
        items: [
          {
            label: 'Ressuscitação cardiopulmonar',
            detail: 'Superfície plana e rígida para compressões torácicas eficientes.',
            icon: 'HeartPulse',
          },
          {
            label: 'Decúbito dorsal',
            detail: 'Paciente de costas — permite compressões e ventilação com extensão cervical.',
            icon: 'Bed',
          },
          {
            label: 'Pegadinha — Trendelenburg',
            detail: 'Trendelenburg ou decúbito ventral para facilitar fluxo sanguíneo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Superfície',
            detail: 'Tábua rígida sem almofada — profundidade efetiva das compressões.',
            icon: 'Square',
          },
        ],
        footer_rule: 'Firme e dorsal — não prona',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Posição correta para manobras de ressuscitação cardiopulmonar?',
          'Eliminar Trendelenburg (A).',
          'Eliminar decúbito ventral (B).',
          'Eliminar sentado (C).',
          'Eliminar decúbito lateral (E).',
          'Decúbito dorsal em superfície firme com cabeça em extensão — marcar D.',
        ],
        footer_rule: 'Costas no chão ou prancha',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'POSIÇÃO — RCP',
        rows: [
          { label: 'Paciente', value: 'Decúbito dorsal — superfície rígida', badge: 'hot' },
          { label: 'Cabeça', value: 'Leve extensão para abrir via aérea', badge: 'ok' },
          { label: 'Evitar', value: 'Prono · lateral · Trendelenburg', badge: 'warn' },
        ],
        footer_rule: 'Almofada macia absorve força',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — rcp posicao decubito dorsal',
        items: [
          {
            label: 'Letra A — Trendelenburg',
            detail: 'Cabeça baixa para fluxo cerebral na parada.',
            correct: 'Decúbito dorsal em superfície firme — posição correta para RCP.',
          },
          {
            label: 'Letra B — decúbito ventral',
            detail: 'Prono para ventilar pulmões na ressuscitação.',
            correct: 'Costas para cima em tábua rígida — gabarito D.',
          },
          {
            label: 'Letra C — sentado',
            detail: 'Sentado melhora circulação durante compressões.',
            correct: 'Decúbito dorsal permite compressões torácicas eficientes.',
          },
          {
            label: 'Letra E — lateral',
            detail: 'Lateral evita aspiração na parada cardiorrespiratória.',
            correct: 'Posição dorsal com extensão cervical — padrão do SBV.',
          },
        ],
        footer_rule: 'Gabarito D — dorsal + superfície firme',
      },
    ],
  },
  'quadrix-enfermagem-urgencias-e-emergencias-1780001220945-4': {
    family: 'protocolo',
    guideline: 'Pós-ROSC — monitorização, temperatura, glicemia, O₂ e exames laboratoriais',
    roi_error: 'cuidados_pos_pcr',
    cluster: 'Cuidados após retorno da circulação espontânea',
    danger_footer: 'Monitorização + temperatura + glicemia + O₂ — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pós-ROSC',
        meta: slideMeta,
        items: [
          {
            label: 'Retorno da circulação',
            detail: 'ROSC após parada cardiorrespiratória — fase pós-PCR com ressuscitação cardiopulmonar concluída.',
            icon: 'HeartPulse',
          },
          {
            label: 'Transição do SBV',
            detail: 'Após compressões torácicas e ROSC — cuidados pós-retorno da circulação espontânea.',
            icon: 'Activity',
          },
          {
            label: 'Monitorização',
            detail: 'Contínua de sinais vitais, temperatura e glicemia capilar.',
            icon: 'Activity',
          },
          {
            label: 'Oxigenação',
            detail: 'Oferta de oxigênio titulada após ressuscitação cardiopulmonar.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — só encaminhar',
            detail: 'Apenas encaminhar à UTI sem controle de temperatura e glicemia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Pós-PCR = cuidados intensivos iniciais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cuidados pós-PCR — após RCP e retorno da circulação espontânea (ROSC): alternativa correta?',
          'Eliminar só monitorizar e comunicar família sem temperatura (A).',
          'Eliminar só UTI e acompanhamento médico sem controle metabólico (C).',
          'Eliminar bólus e família sem temperatura/glicemia (D).',
          'Eliminar temperatura sem monitorização contínua completa (E).',
          'Monitorização · temperatura · glicemia · drogas · O₂ · exames — marcar B.',
        ],
        footer_rule: 'Pacote completo pós-ROSC',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PÓS-PCR',
        rows: [
          { label: 'Contexto', value: 'Pós-ROSC · após SBV e compressões torácicas', badge: 'hot' },
          { label: 'Monitor', value: 'Contínuo — sinais vitais e ritmo', badge: 'ok' },
          { label: 'Metabólico', value: 'Temperatura e glicemia controladas', badge: 'warn' },
        ],
        footer_rule: 'Prevenir reparada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — cuidados pos pcr',
        items: [
          {
            label: 'Letra A — só monitorizar',
            detail: 'Monitorização e família sem controle de temperatura e glicemia.',
            correct: 'Pacote pós-ROSC inclui temperatura, glicemia e oxigênio — gabarito B.',
          },
          {
            label: 'Letra C — só UTI',
            detail: 'Encaminhar à UTI sem controle térmico e glicêmico inicial.',
            correct: 'Cuidados pós-PCR exigem monitorização e suporte metabólico.',
          },
          {
            label: 'Letra D — bólus isolado',
            detail: 'Medicação em bólus sem temperatura e glicemia.',
            correct: 'Alternativa B completa o cuidado pós-retorno da circulação.',
          },
          {
            label: 'Letra E — temperatura parcial',
            detail: 'Temperatura e glicemia sem monitorização contínua adequada.',
            correct: 'Monitorização contínua + temperatura + glicemia + O₂ — gabarito B.',
          },
        ],
        footer_rule: 'Gabarito B — pacote pós-ROSC',
      },
    ],
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-5': {
    family: 'certo_errado',
    guideline: 'DEA — equipe de enfermagem treinada pode operar; não é exclusividade médica',
    roi_error: 'dea_enfermagem_certo_errado',
    cluster: 'Certo ou errado — desfibrilador externo automático',
    danger_footer: 'DEA para profissionais treinados — Certo — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DEA — equipe',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Desfibrilação precoce aumenta chance de sobrevida na PCR.',
            icon: 'HeartPulse',
          },
          {
            label: 'DEA',
            detail: 'Desfibrilador externo automático — técnico e enfermagem podem operar.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — só médico',
            detail: 'Reservar DEA exclusivamente ao médico atrasa desfibrilação.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Treinamento',
            detail: 'Qualquer profissional de saúde capacitado pode usar o aparelho.',
            icon: 'GraduationCap',
          },
        ],
        footer_rule: 'Ligar DEA assim que disponível',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'DEA em urgência — profissionais de saúde treinados podem usar?',
          'Enfermagem e técnicos capacitados podem operar o DEA.',
          'Não é atribuição exclusiva do médico.',
          'Afirmativa verdadeira — julgar CERTO.',
          'Marcar A (Certo).',
        ],
        footer_rule: 'SBV inclui DEA precoce',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DEA — EQUIPE',
        rows: [
          { label: 'Quem usa', value: 'Profissionais treinados — inclui enfermagem', badge: 'hot' },
          { label: 'RCP', value: 'Compressões até o DEA estar pronto', badge: 'ok' },
          { label: 'Ritmos', value: 'FV/TVSP — desfibrilar', badge: 'warn' },
        ],
        footer_rule: 'Não esperar médico para desfibrilar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — dea enfermagem certo errado',
        items: [
          {
            label: 'Errado — DEA só médico',
            detail: 'Julgar como falsa a permissão do DEA à enfermagem.',
            correct: 'Certo — profissionais treinados, incluindo enfermagem, podem usar DEA.',
          },
          {
            label: 'Pegadinha — exclusão médica',
            detail: 'Reservar desfibrilador apenas ao médico na parada cardiorrespiratória.',
            correct: 'Equipe de enfermagem treinada pode operar DEA — gabarito Certo.',
          },
        ],
        footer_rule: 'Gabarito A — Certo',
      },
    ],
  },
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004917460-5': {
    family: 'certo_errado',
    guideline: 'RCP adulto — C-A-B: compressões torácicas antes de ventilações de resgate',
    roi_error: 'cab_ventilar_antes_certo_errado',
    cluster: 'Certo ou errado — sequência C-A-B no adulto',
    danger_footer: 'Ventilar antes de comprimir é falso — gabarito B Errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'C-A-B adulto',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Adulto inconsciente sem respiração normal — iniciar SBV imediato.',
            icon: 'HeartPulse',
          },
          {
            label: 'Compressões primeiro',
            detail: 'C-A-B — compressões torácicas antes das ventilações de resgate.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — ventilar primeiro',
            detail: 'Duas ventilações de resgate antes de iniciar compressões torácicas.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Segurança',
            detail: 'Garantir segurança da cena antes de aproximar da vítima.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Comprimir primeiro no adulto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Adulto inconsciente sem respiração — ventilar antes de comprimir?',
          'AHA adulto: compressões torácicas primeiro (C-A-B).',
          'Ventilar antes de comprimir atrasa perfusão coronariana.',
          'Afirmativa falsa — julgar ERRADO.',
          'Marcar B (Errado).',
        ],
        footer_rule: 'C-A-B no adulto — não A-B-C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEQUÊNCIA — ADULTO',
        rows: [
          { label: 'C-A-B', value: 'Compressões → ventilações de resgate', badge: 'hot' },
          { label: 'Frequência', value: 'Cem a cento e vinte compressões por minuto', badge: 'ok' },
          { label: 'Não', value: 'Duas ventilações antes da primeira compressão', badge: 'warn' },
        ],
        footer_rule: 'Perfusão > oxigênio inicial',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — cab ventilar antes certo errado',
        items: [
          {
            label: 'Certo — ventilar antes',
            detail: 'Aplicar duas ventilações antes das compressões torácicas.',
            correct: 'Errado — adulto em PCR: compressões torácicas primeiro (C-A-B).',
          },
          {
            label: 'Pegadinha — A-B-C',
            detail: 'Priorizar ventilação de resgate antes de comprimir o esterno.',
            correct: 'Iniciar compressões rítmicas — depois ventilar na proporção correta.',
          },
        ],
        footer_rule: 'Gabarito B — Errado',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const meta = metaBase(
      raw,
      pack.family,
      pack.guideline,
      slug,
      pack.roi_error,
      pack.cluster,
      REVIEWER,
    );
    const out = {
      meta,
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g08] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g08] total=${ok}`);
}

main();
