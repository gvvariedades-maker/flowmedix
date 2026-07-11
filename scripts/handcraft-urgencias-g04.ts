#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g04 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g04.ts
 *   npx tsx scripts/handcraft-urgencias-g04.ts
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

const LOTE = 'urgencias-g04';
const REVIEWER = 'handcraft-urgencias-g04';

const SPECS: Record<string, Pack> = {
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-2': {
    family: 'protocolo',
    guideline: 'AHA 2020 — RCP gestante: priorizar mãe; monitoramento fetal não atrasa compressões',
    roi_error: 'rcp_gestante_ignorar_feto',
    cluster: 'PCR gestante — aspecto a ignorar durante RCP',
    danger_footer: 'Monitoramento fetal pode aguardar — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP na gestante',
        meta: slideMeta,
        items: [
          {
            label: 'PCR materna',
            detail: 'RCP de alta qualidade e deslocamento uterino lateral — salvar a mãe salva o feto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Via aérea e oxigenação',
            detail: 'Manejo da via aérea e oxigenação materna — não postergar.',
            icon: 'Wind',
          },
          {
            label: 'Monitoramento fetal',
            detail: 'Pode ser ignorado/adia durante RCP — não interromper compressões.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha — ignorar cuidados',
            detail: 'Confundir o que pode aguardar: RCP, deslocamento uterino e via aérea não se ignoram.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Mãe primeiro — compressões sem pausa para Doppler',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR em gestante — qual aspecto pode ser ignorado (AHA 2020)?',
          'RCP de alta qualidade — obrigatória; eliminar B.',
          'Deslocamento uterino lateral — manobra essencial; eliminar C.',
          'Oxigenação e via aérea — manter; eliminar D.',
          'Monitoramento do feto — pode aguardar durante RCP.',
          'Marcar A.',
        ],
        footer_rule: 'Não parar compressões para avaliar feto',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GESTANTE — AHA 2020',
        rows: [
          { label: 'Prioridade', value: 'RCP materna imediata + deslocamento uterino', badge: 'hot' },
          { label: 'Via aérea', value: 'Oxigenação e manejo — manter', badge: 'ok' },
          { label: 'Feto', value: 'Monitoramento não atrasa compressões torácicas', badge: 'warn' },
          { label: 'Compressões', value: '100–120/min · profundidade 5–6 cm', badge: 'ok' },
        ],
        footer_rule: 'Salvar mãe = melhor chance ao feto',
      },
      null as unknown,
    ],
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-3': {
    family: 'protocolo',
    guideline: 'Cadeia intra-hospitalar — após reconhecimento/ativação: RCP de alta qualidade',
    roi_error: 'cadeia_intra_2elo_rcp',
    cluster: 'PCR intra-hospitalar — 2º elo cadeia de sobrevivência',
    danger_footer: '2º elo = RCP alta qualidade — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia intra-hospitalar',
        meta: slideMeta,
        items: [
          {
            label: '1º elo',
            detail: 'Reconhecimento da parada cardiorrespiratória + acionamento imediato da equipe.',
            icon: 'Bell',
          },
          {
            label: '2º elo',
            detail: 'RCP de alta qualidade — compressões imediatas.',
            icon: 'HeartPulse',
          },
          {
            label: '3º elo',
            detail: 'Desfibrilação precoce quando ritmo chocável.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — ordem invertida',
            detail: 'Desfibrilar antes de comprimir ou via aérea avançada antes de RCP de alta qualidade.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Reconhecer → comprimir → chocar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR intra-hospitalar — identificada e equipe acionada: próximo passo?',
          '1º elo já cumprido — reconhecimento e acionamento feitos.',
          'Eliminar desfibrilação antes de RCP (B).',
          'Eliminar ressuscitação avançada ou via aérea antes de compressões (C, D, E).',
          '2º elo: RCP de alta qualidade.',
          'Marcar A.',
        ],
        footer_rule: 'Compressões antes de drogas e intubação',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ELOS INTRA-HOSPITALAR',
        rows: [
          { label: '1', value: 'Detecção precoce + ativação', badge: 'hot' },
          { label: '2', value: 'RCP de alta qualidade', badge: 'ok' },
          { label: '3', value: 'Desfibrilação precoce', badge: 'ok' },
          { label: '4–5', value: 'Ressuscitação avançada · Cuidados pós-PCR', badge: 'info' },
        ],
        footer_rule: 'Após acionar: comprimir já',
      },
      null as unknown,
    ],
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006962671-9': {
    family: 'protocolo',
    guideline: 'AHA 2025 PCREH — benéfico ter profissional com Suporte Avançado; não é exclusivo SBV nem obrigatório sempre',
    roi_error: 'pcreh_equipe_sav',
    cluster: 'PCREH — composição da equipe AHA 2025',
    danger_footer: 'SAV benéfico, não exclusivo SBV — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Equipe PCREH',
        meta: slideMeta,
        items: [
          {
            label: 'Parada extra-hospitalar',
            detail: 'PCREH — reconhecimento, SBV e acionamento do serviço de emergência.',
            icon: 'Ambulance',
          },
          {
            label: 'Suporte Básico',
            detail: 'Compressões e ventilações — qualquer socorrista treinado inicia RCP.',
            icon: 'HeartPulse',
          },
          {
            label: 'Suporte Avançado',
            detail: 'Pode ser benéfico na suspeita de PCREH — não obrigatório em todos os cenários.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — extremos SBV/SAV',
            detail: '“Exclusivamente SBV” ou “SAV obrigatório em todos os cenários” — generalizações falsas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ideal: misto SBV + SAV quando possível',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'AHA 2025 — equipe na Parada Cardiorrespiratória Extra-Hospitalar?',
          'Eliminar “exclusivamente SBV, SAV desnecessário” (A).',
          'Eliminar “SAV obrigatório em todos os cenários” (B).',
          'Eliminar “equipes reduzidas para evitar conflito” (D).',
          'Correto: benéfico profissional habilitado em Suporte Avançado de Vida.',
          'Marcar C.',
        ],
        footer_rule: 'SAV ajuda — mas SBV não pode esperar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PCREH — AHA 2025',
        rows: [
          { label: 'SBV', value: 'Início imediato por socorrista treinado', badge: 'hot' },
          { label: 'SAV', value: 'Benéfico quando disponível — não exclusivo', badge: 'ok' },
          { label: 'Emergência', value: 'Acionar serviço médico de emergência cedo', badge: 'warn' },
          { label: 'Evitar', value: 'Aguardar SAV para iniciar compressões', badge: 'info' },
        ],
        footer_rule: 'Comprimir enquanto equipe chega',
      },
      null as unknown,
    ],
  },
  'instituto-consulpam-enfermagem-urgencias-e-emergencias-1777103981770-0': {
    family: 'protocolo',
    guideline: 'PCR — perda de bombeamento; reconhecimento por pulso/apneia/inconsciência; atendimento pré-hospitalar eficaz reduz agravos',
    roi_error: 'vf_pcr_caracteristicas',
    cluster: 'PCR — julgamento V/F sobre definição e reconhecimento',
    danger_footer: 'Três assertivas verdadeiras — gabarito A (V-V-V)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'O que é PCR?',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'PCR — perda da capacidade de bombeamento cardíaco; iniciar RCP/SBV.',
            icon: 'HeartOff',
          },
          {
            label: 'Reconhecimento',
            detail: 'Ausência de pulso central, apneia ou gasping, inconsciência na PCR.',
            icon: 'Activity',
          },
          {
            label: 'Atendimento pré-hospitalar',
            detail: 'SBV precoce na parada cardiorrespiratória reduz agravos e mortalidade.',
            icon: 'Ambulance',
          },
          {
            label: 'Pegadinha — sequência V/F',
            detail: 'Marcar F em item verdadeiro sobre pulso central e apneia na PCR.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PCR = sem pulso + compressões torácicas imediatas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar assertivas sobre parada cardiorrespiratória (PCR).',
          'Item 1: perda de bombeamento cardíaco → Verdadeiro.',
          'Item 2: pulso central, apneia, inconsciência → Verdadeiro.',
          'Item 3: atendimento pré-hospitalar eficaz reduz agravos → Verdadeiro.',
          'Sequência V-V-V.',
          'Marcar A.',
        ],
        footer_rule: 'Três V — nenhuma assertiva falsa',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RECONHECER PCR',
        rows: [
          { label: 'PCR', value: 'Sem bombeamento cardíaco efetivo', badge: 'hot' },
          { label: 'Sinais', value: 'Inconsciência + ausência de pulso central + apneia', badge: 'ok' },
          { label: 'SBV', value: 'Iniciar RCP imediatamente após reconhecimento', badge: 'warn' },
          { label: 'Pré-hospitalar', value: 'Tempo até compressões determina sobrevida', badge: 'ok' },
        ],
        footer_rule: 'Reconhecer rápido → comprimir',
      },
      null as unknown,
    ],
  },
  'instituto-consulpam-enfermagem-urgencias-e-emergencias-1777103981770-1': {
    family: 'protocolo',
    guideline: 'SBC 2019 — compressões: frequência, profundidade, retorno do tórax, interrupção mínima',
    roi_error: 'compressoes_qualidade_sbc',
    cluster: 'Qualidade das compressões — diretriz SBC 2019',
    danger_footer: 'Frequência + profundidade + retorno + mínima interrupção — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Compressões de qualidade',
        meta: slideMeta,
        items: [
          {
            label: 'Sociedade Brasileira de Cardiologia',
            detail: 'Atualização 2019 — protocolos e algoritmos de RCP para leigos e profissionais.',
            icon: 'BookOpen',
          },
          {
            label: 'Frequência',
            detail: '100–120 compressões por minuto — morbidade e mortalidade caem com RCP de qualidade.',
            icon: 'Gauge',
          },
          {
            label: 'Profundidade',
            detail: '5–6 cm no adulto — não 7 cm mínimo (pegadinha).',
            icon: 'ArrowDown',
          },
          {
            label: 'Retorno completo',
            detail: 'Tórax deve retornar totalmente a cada compressão — perfusão coronariana.',
            icon: 'MoveVertical',
          },
          {
            label: 'Interrupção mínima',
            detail: 'Pausas curtas — não prolongar para pulso ou ventilação.',
            icon: 'Timer',
          },
        ],
        footer_rule: 'Alta qualidade = todas as variáveis juntas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Parada cardiorrespiratória — SBC 2019: aspectos principais das compressões?',
          'Emergência cardiovascular — protocolos padronizam frequência e profundidade.',
          'Eliminar profundidade mínima 7 cm (B).',
          'Eliminar pausas máximas de 15 s como regra fixa (C).',
          'Eliminar posicionar-se sobre a vítima para estabilidade (D).',
          'Correto: frequência, profundidade, retorno do tórax, interrupção mínima.',
          'Marcar A.',
        ],
        footer_rule: '5–6 cm · 100–120/min · soltar o tórax',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — COMPRESSÕES',
        rows: rcpParamRows([
          { label: 'Retorno', value: 'Tórax retorna completamente a cada compressão', badge: 'hot' },
          { label: 'Interrupção', value: 'Manter pausas mínimas — não checar pulso a cada ciclo', badge: 'warn' },
        ]),
        footer_rule: 'Qualidade > velocidade isolada',
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-6': {
    family: 'protocolo',
    guideline: 'Cadeia extra-hospitalar AHA — acionamento → RCP → desfibrilação → avançado → pós-PCR → recuperação',
    roi_error: 'cadeia_extra_hospitalar_ordem',
    cluster: 'Cadeia de sobrevivência — ambiente extra-hospitalar',
    danger_footer: 'Ordem com recuperação no final — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia extra-hospitalar',
        meta: slideMeta,
        items: [
          {
            label: 'Acionamento',
            detail: 'Chamar serviço de emergência — 2º passo após reconhecer PCR.',
            icon: 'Phone',
          },
          {
            label: 'RCP alta qualidade',
            detail: 'Compressões imediatas enquanto aguarda DEA/equipe.',
            icon: 'HeartPulse',
          },
          {
            label: 'Desfibrilação',
            detail: 'DEA assim que disponível — ritmos chocáveis.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — elos invertidos',
            detail: 'Pular acionamento do serviço ou desfibrilação antes de RCP de alta qualidade.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Acionar · comprimir · chocar · avançar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cadeia extra-hospitalar AHA — ordem dos elos?',
          'Comparar alternativas — todas citam RCP e desfibrilação.',
          'B inclui recuperação após cuidados pós-PCR — elo final completo.',
          'C omite ressuscitação avançada; D mistura segurança da cena como elo numerado.',
          'Marcar B.',
        ],
        footer_rule: 'Recuperação fecha a cadeia extra-hospitalar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EXTRA-HOSPITALAR AHA',
        rows: [
          { label: '1', value: 'Acionamento do serviço de emergência', badge: 'hot' },
          { label: '2', value: 'RCP de alta qualidade', badge: 'ok' },
          { label: '3', value: 'Desfibrilação precoce', badge: 'ok' },
          { label: '4–6', value: 'Ressuscitação avançada · Pós-PCR · Recuperação', badge: 'info' },
        ],
        footer_rule: 'Ordem organizada salva vidas',
      },
      null as unknown,
    ],
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-0': {
    family: 'protocolo',
    guideline: 'SBV — segurança da cena; verificar responsividade e respiração; acionar emergência; iniciar compressões',
    roi_error: 'sbv_avaliacao_primaria',
    cluster: 'Avaliação primária — vítima inconsciente em via pública',
    danger_footer: 'Responsividade → respiração → acionar → comprimir — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Avaliação primária SBV',
        meta: slideMeta,
        items: [
          {
            label: 'Segurança da cena',
            detail: 'Garantir ambiente seguro antes de aproximar da vítima.',
            icon: 'Shield',
          },
          {
            label: 'Responsividade',
            detail: 'Estimular e perguntar — inconsciência confirma necessidade de SBV.',
            icon: 'User',
          },
          {
            label: 'Respiração',
            detail: 'Avaliar respiração normal em até 10 s — gasping conta como ausente.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — pular passos',
            detail: 'Comprimir sem checar ou ventilar antes de comprimir (C-A-B).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Checar antes de comprimir — mas sem demora',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Vítima adulta inconsciente — conduta SBV alinhada às diretrizes?',
          'Eliminar compressões sem avaliar responsividade e respiração (A).',
          'Eliminar ventilações antes de compressões (C).',
          'Eliminar aguardar suporte avançado (D).',
          'Verificar responsividade e respiração, acionar serviço, iniciar compressões.',
          'Marcar B.',
        ],
        footer_rule: 'Acionar ajuda e comprimir — C-A-B',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEQUÊNCIA SBV',
        rows: [
          { label: '1', value: 'Segurança da cena', badge: 'hot' },
          { label: '2', value: 'Responsividade + respiração (~10 s)', badge: 'ok' },
          { label: '3', value: 'Acionar serviço de emergência / pedir DEA', badge: 'ok' },
          { label: '4', value: 'Iniciar compressões torácicas (C-A-B)', badge: 'warn' },
        ],
        footer_rule: 'Não ventilar antes de comprimir no adulto',
      },
      null as unknown,
    ],
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-2': {
    family: 'conceito',
    guideline: 'Ritmos desfibriláveis na PCR — Fibrilação Ventricular e Taquicardia Ventricular sem pulso',
    roi_error: 'ritmo_desfibrilavel_fv',
    cluster: 'PCR monitorizada — identificar ritmo desfibrilável',
    danger_footer: 'FV é ritmo desfibrilável — desfibrilar — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ritmos desfibriláveis',
        meta: slideMeta,
        items: [
          {
            label: 'Fibrilação Ventricular',
            detail: 'Ritmo desfibrilável na parada cardiorrespiratória — desfibrilação imediata.',
            icon: 'Zap',
          },
          {
            label: 'TV sem pulso',
            detail: 'Taquicardia ventricular sem pulso — também desfibrilável na PCR.',
            icon: 'Activity',
          },
          {
            label: 'Não desfibriláveis',
            detail: 'Assistolia e AESP — compressões torácicas; sem desfibrilação.',
            icon: 'HeartOff',
          },
          {
            label: 'Pegadinha — fibrilação atrial',
            detail: 'Confundir fibrilação atrial com ritmo desfibrilável de parada cardiorrespiratória.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'FV/TVSP → desfibrilar com DEA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Parada cardiorrespiratória — ritmo desfibrilável no monitor: qual alternativa?',
          'Eliminar assistolia — ritmo não desfibrilável (A).',
          'Eliminar AESP — atividade elétrica sem pulso (B).',
          'Eliminar fibrilação atrial — não é ritmo de PCR desfibrilável (C).',
          'Eliminar bradicardia isolada (E).',
          'Fibrilação Ventricular — marcar D.',
        ],
        footer_rule: 'Desfibrilável = FV ou TV sem pulso',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RITMOS DESFIBRILÁVEIS',
        rows: [
          { label: 'Desfibriláveis', value: 'Fibrilação Ventricular · TV sem pulso', badge: 'hot' },
          { label: 'Não desfibriláveis', value: 'Assistolia · AESP', badge: 'ok' },
          { label: 'Conduta', value: 'RCP + desfibrilação precoce nos ritmos desfibriláveis', badge: 'warn' },
          { label: 'DEA', value: 'Analisa ritmo — aplica desfibrilação se indicado', badge: 'info' },
        ],
        footer_rule: 'Reconhecer FV → desfibrilar cedo',
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-2': {
    B: 'RCP de alta qualidade não se ignora — compressões torácicas imediatas na gestante.',
    C: 'Deslocamento uterino lateral não se ignora — reduz compressão da veia cava.',
    D: 'Oxigenação e via aérea não se ignoram — manejo materno contínuo.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-3': {
    B: 'Desfibrilação antes de comprimir — ordem invertida; RCP de alta qualidade é 2º elo.',
    C: 'Ressuscitação avançada vem depois das compressões torácicas iniciais.',
    D: 'Recuperação pós-PCR é elo final — não o próximo passo imediato.',
    E: 'Via aérea avançada antes de RCP de alta qualidade — atrasa compressões.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006962671-9': {
    A: 'Ressuscitação exclusivamente SBV ignora benefício do Suporte Avançado de Vida.',
    B: 'SAV obrigatório em todos os cenários — generalização falsa da banca.',
    D: 'Equipe reduzida por conflito não é recomendação AHA 2025 para PCREH.',
  },
  'instituto-consulpam-enfermagem-urgencias-e-emergencias-1777103981770-0': {
    B: 'Item 2 é verdadeiro — pulso central e apneia reconhecem parada cardiorrespiratória.',
    C: 'Sequência F-V-F inverte itens corretos da PCR.',
    D: 'F-F-V marca falsos em definição e reconhecimento da parada cardiorrespiratória.',
  },
  'instituto-consulpam-enfermagem-urgencias-e-emergencias-1777103981770-1': {
    B: '7 cm mínimo excede profundidade segura (5–6 cm).',
    C: 'Pausas de 15 s não são meta — interrupção deve ser mínima.',
    D: 'Posicionar-se sobre a vítima não é critério de qualidade SBC.',
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-6': {
    A: 'Falta elo de recuperação — cadeia extra-hospitalar incompleta.',
    C: 'Omite ressuscitação avançada — desfibrilação antes de RCP de alta qualidade não é o erro aqui.',
    D: 'Segurança da cena não substitui acionamento do serviço de emergência na cadeia AHA.',
  },
  'instituto-verbena-enfermagem-processo-de-enfermagem-1780008210115-0': {
    A: 'Compressões sem checar responsividade e respiração violam avaliação primária.',
    C: 'Ventilar antes de comprimir contraria C-A-B no adulto.',
    D: 'Aguardar suporte avançado atrasa RCP — conduta incorreta.',
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-2': {
    A: 'Assistolia — ritmo não desfibrilável; continuar compressões torácicas.',
    B: 'AESP — não indicar desfibrilação imediata na parada cardiorrespiratória.',
    C: 'Fibrilação atrial não é ritmo desfibrilável típico de PCR monitorizada.',
    E: 'Bradicardia isolada não corresponde ao ritmo desfibrilável da questão.',
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
    console.log(`[handcraft:urgencias-g04] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g04] total=${ok}`);
}

main();
