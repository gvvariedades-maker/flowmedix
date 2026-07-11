#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g02 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g02.ts
 *   npx tsx scripts/handcraft-urgencias-g02.ts
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

const LOTE = 'urgencias-g02';
const REVIEWER = 'handcraft-urgencias-g02';

const SPECS: Record<string, Pack> = {
  'furb-enfermagem-processo-de-enfermagem-1780011915153-0': {
    family: 'protocolo',
    guideline: 'AHA/MS SBV — antes da VAA avançada: 30 compressões : 2 ventilações',
    roi_error: 'rcp_30_2_pre_vaa',
    cluster: 'RCP adulto — proporção 30:2 pré-via aérea avançada',
    danger_footer: 'Profissional antes da VAA: 30:2 — não proporção infantil nem 25:4 — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP — 30:2 pré-VAA',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'PCR adulto — RCP por profissional antes de via aérea avançada (intubação).',
            icon: 'Target',
          },
          {
            label: 'Proporção correta',
            detail: '30 compressões torácicas seguidas de 2 ventilações (30:2).',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — proporção infantil',
            detail: 'Proporção infantil (quinze compressões) — não do adulto nesta fase.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha — 25:4 ou 30:4',
            detail: 'Proporções inventadas — padrão AHA adulto é 30:2.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Antes da VAA: 30:2 · compressões 100–120/min',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'RCP adulto — relação compressões:ventilações antes da via aérea avançada?',
          'Eliminar 25:4 e 30:4 — proporções não padronizadas.',
          'Eliminar proporções infantis (quinze compressões) e quinze para quatro.',
          'Resta 30 compressões seguidas de 2 ventilações.',
          'Marcar A.',
        ],
        footer_rule: 'Pós-intubação muda ventilação — aqui é pré-VAA',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — 30:2 ADULTO',
        rows: rcpParamRows([
          { label: 'Pré-VAA', value: '30 compressões : 2 ventilações', badge: 'hot' },
          { label: 'Infantil', value: 'Proporção infantil — não usar no adulto desta questão', badge: 'warn' },
        ]),
        footer_rule: '30:2 até VAA avançada colocada',
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-urgencias-e-emergencias-1777103970505-1': {
    family: 'protocolo',
    guideline: 'MS/SAMU — Tipo B = ambulância de suporte básico (SBV, O₂, DEA)',
    roi_error: 'samu_ambulancia_tipo_b',
    cluster: 'SAMU — classificação ambulância tipo B (suporte básico)',
    danger_footer: 'Tipo B = suporte básico — não confundir com resgate ou tipo A — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ambulâncias — tipos MS',
        meta: slideMeta,
        items: [
          {
            label: 'Função',
            detail: 'Transporte de enfermos terrestre, aéreo ou hidroviário — classificação por suporte.',
            icon: 'Ambulance',
          },
          {
            label: 'Tipo B',
            detail: 'Ambulância de suporte básico — SBV, oxigênio, DEA, equipe habilitada.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — tipo A',
            detail: 'Tipo A não é “resgate” nem veículo exclusivo de emergência nesta classificação.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — tipo C',
            detail: 'Tipo C é suporte avançado/UTI móvel — não suporte básico.',
            icon: 'Truck',
          },
        ],
        footer_rule: 'B = básico = SBV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Classificação de ambulâncias — qual afirmativa está correta?',
          'Eliminar Tipo A como ambulância de resgate.',
          'Eliminar Tipo C como suporte básico.',
          'Eliminar Tipo A como veículo exclusivo de emergências.',
          'Resta Tipo B — ambulância de suporte básico.',
          'Marcar B.',
        ],
        footer_rule: 'Memorize: B = básico',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CLASSIFICAÇÃO SAMU',
        rows: [
          { label: 'Tipo A', value: 'Transporte simples — sem suporte avançado', badge: 'info' },
          { label: 'Tipo B', value: 'Suporte básico — SBV · O₂ · DEA', badge: 'hot' },
          { label: 'Tipo C/D', value: 'Suporte avançado / UTI móvel', badge: 'ok' },
          { label: 'Pegadinha', value: 'Trocar B por “resgate” ou C por “básico”', badge: 'warn' },
        ],
        footer_rule: 'Prova cobra nomenclatura MS/SAMU',
      },
      null as unknown,
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-1': {
    family: 'protocolo',
    guideline: 'AHA SBV — C-A-B: compressões → via aérea → ventilação → DEA',
    roi_error: 'rcp_cab_sequencia',
    cluster: 'RCP adulto — sequência C-A-B (compressões primeiro)',
    danger_footer: 'Compressões antes de pulso isolado ou DEA primeiro — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SBV — sequência C-A-B',
        meta: slideMeta,
        items: [
          {
            label: 'Suporte básico de vida',
            detail: 'American Heart Association — parada cardiorrespiratória exige sequência padronizada.',
            icon: 'HeartPulse',
          },
          {
            label: 'Ordem correta',
            detail: 'Compressões torácicas → abertura via aérea → ventilação → desfibrilação.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — pulso primeiro',
            detail: 'Avaliar pulsação antes de comprimir atrasa perfusão cerebral.',
            icon: 'Timer',
          },
          {
            label: 'Pegadinha — DEA antes',
            detail: 'Desfibrilar sem compressões iniciais reduz chance de sobrevida.',
            icon: 'Zap',
          },
        ],
        footer_rule: 'Comprimir → ventilar → chocar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'SBV AHA — sequência correta na parada cardiorrespiratória?',
          'Eliminar começar por avaliação de pulso isolada.',
          'Eliminar desfibrilação antes de compressões e ventilação.',
          'Eliminar abrir via aérea antes de comprimir (C-A-B).',
          'Resta compressões → VA → ventilação → desfibrilação imediata.',
          'Marcar A.',
        ],
        footer_rule: 'C-A-B: compressões primeiro',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEQUÊNCIA SBV',
        rows: rcpParamRows([
          { label: 'C-A-B', value: 'Compressões · Via aérea · Ventilação/respiração', badge: 'hot' },
          { label: 'DEA', value: 'Ligar e aplicar assim que disponível', badge: 'ok' },
        ]),
        footer_rule: 'Minimizar tempo sem compressões',
      },
      null as unknown,
    ],
  },
  'gama-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-7': {
    family: 'protocolo',
    guideline: 'RCP intubado — manter ventilador em modo controlado; máx. 10 ventilações/min',
    roi_error: 'rcp_intubado_ventilador',
    cluster: 'RCP adulto — PCR intubado em UTI (ventilador mecânico)',
    danger_footer: 'Intubado: manter VM em modo controlado — não BVM isolada — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR intubado — UTI',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Parada cardiorrespiratória em adulto já intubado — reanimação na UTI.',
            icon: 'Building2',
          },
          {
            label: 'Ventilador mecânico',
            detail: 'Manter conectado — modo controlado, FiO₂ 100%, frequência ~10 irpm.',
            icon: 'Wind',
          },
          {
            label: 'Compressões',
            detail: 'RCP 100–120/min contínua — ventilação pelo circuito, não hiperventilar.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — BVM',
            detail: 'Desconectar VM para bolsa-válvula-máscara não é conduta padrão nesta prova.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Intubado: VM controlado + compressões',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR em paciente intubado na UTI — conduta ventilatória na RCP?',
          'Eliminar suspender VM e ventilar com BVM a cada 6 s.',
          'Eliminar manter parâmetros prévios sem ajuste de modo/FiO₂.',
          'Eliminar desconectar VM para BVM assíncrona.',
          'Resta manter VM em modo controlado — 10 irpm e FiO₂ 100%.',
          'Marcar D.',
        ],
        footer_rule: 'Evitar hiperventilação — máx. 10 vent/min',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RCP — INTUBADO',
        rows: [
          { label: 'Ventilação', value: 'Manter ventilador — modo controlado · FiO₂ 100%', badge: 'hot' },
          { label: 'Frequência', value: '≈10 ventilações/min — evitar hiperventilação', badge: 'ok' },
          { label: 'Compressões', value: '100–120/min contínuas', badge: 'ok' },
          { label: 'Pegadinha', value: 'BVM isolada desconectando VM', badge: 'warn' },
        ],
        footer_rule: 'Circuito fechado + compressões de qualidade',
      },
      null as unknown,
    ],
  },
  'funcern-enfermagem-urgencias-e-emergencias-1777104000896-4': {
    family: 'protocolo',
    guideline: 'AHA cadeia intra-hospitalar — 6 elos incluindo recuperação pós-PCR',
    roi_error: 'cadeia_intra_hospitalar_recuperacao',
    cluster: 'RCP adulto — cadeia de sobrevivência intra-hospitalar (6 elos)',
    danger_footer: 'Intra-hospitalar: 6º elo = recuperação — não “segurança da cena” — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia intra-hospitalar',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'PCR no ambiente hospitalar — equipe e DEA já presentes, mas sequência mantida.',
            icon: 'Building2',
          },
          {
            label: 'Elos 1–5',
            detail: 'Reconhecimento · acionamento · RCP · desfibrilação · cuidados pós-PCR.',
            icon: 'Link',
          },
          {
            label: '6º elo',
            detail: 'Recuperação — reabilitação neurológica e suporte pós-alta.',
            icon: 'RefreshCw',
          },
          {
            label: 'Pegadinha pré-hospitalar',
            detail: '“Segurança da cena” é elo pré-hospitalar — não a ordem intra-hospitalar cobrada.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hospital: reconhecer → equipe → RCP → DEA → pós-PCR → recuperação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR intra-hospitalar — ordem dos elos AHA?',
          'Eliminar sequências que começam com “segurança da cena”.',
          'Eliminar opções sem o elo recuperação (6 elos completos).',
          'Confirmar: reconhecimento → acionamento → RCP → desfibrilação → pós-PCR → recuperação.',
          'Marcar C.',
        ],
        footer_rule: 'Recuperação fecha a cadeia hospitalar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CADEIA AHA — INTRA-HOSPITALAR',
        rows: [
          { label: '1', value: 'Reconhecimento precoce e prevenção', badge: 'hot' },
          { label: '2', value: 'Acionamento do serviço de emergência/equipe', badge: 'ok' },
          { label: '3–4', value: 'RCP alta qualidade · Desfibrilação precoce', badge: 'ok' },
          { label: '5–6', value: 'Cuidados pós-PCR · Recuperação', badge: 'warn' },
          { label: 'Pegadinha', value: 'Trocar por “segurança da cena” (pré-hospitalar)', badge: 'warn' },
        ],
        footer_rule: '6 elos no hospital — inclui recuperação',
      },
      null as unknown,
    ],
  },
  'funcern-enfermagem-urgencias-e-emergencias-1777104007115-5': {
    family: 'protocolo',
    guideline: 'AHA ACLS — vasopressor de 1ª linha na parada cardiorrespiratória (adulto)',
    roi_error: 'rcp_vasopressor_primeira_linha',
    cluster: 'RCP adulto — American Heart Association · vasopressor na PCR',
    danger_footer: 'Vasopressor de 1ª linha na PCR — não confundir 30:2 nem pulso — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP avançada — American Heart Association',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Ressuscitação cardiopulmonar em adultos — recomendações AHA na parada cardiorrespiratória.',
            icon: 'Target',
          },
          {
            label: 'Vasopressor PCR',
            detail: 'Droga vasopressora de primeira linha em todos os ritmos de parada cardiorrespiratória.',
            icon: 'Syringe',
          },
          {
            label: 'Proporção SBV',
            detail: '30 compressões : 2 ventilações — não ventilar a cada 20 compressões.',
            icon: 'Activity',
          },
          {
            label: 'Pulso na RCP',
            detail: 'Reavaliar ~a cada 2 min — não em intervalo de três minutos.',
            icon: 'Timer',
          },
        ],
        footer_rule: 'AHA: compressões 100–120/min + vasopressor na PCR',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'American Heart Association — ressuscitação cardiopulmonar em adultos: afirmativa correta?',
          'Eliminar ventilação a cada 20 compressões (proporção errada).',
          'Eliminar checagem de pulso em intervalo prolongado incorreto.',
          'Eliminar frequência fixa “100” sem faixa 100–120/min.',
          'Resta vasopressor de primeira linha na parada cardiorrespiratória.',
          'Marcar C.',
        ],
        footer_rule: '30:2 · 100–120/min · vasopressor na PCR',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RCP AHA — ADULTO',
        rows: rcpParamRows([
          { label: 'Vasopressor PCR', value: 'Primeira linha em parada cardiorrespiratória', badge: 'hot' },
        ]),
        footer_rule: 'PCR adulto: comprimir + droga conforme ACLS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARÂMETROS RCP AHA',
        items: [
          {
            label: 'Letra A — ventilação a cada 20 compressões',
            detail: 'Proporção incorreta — padrão é 30:2 com dois socorristas.',
            correct: '30 compressões : 2 ventilações — não 20:1.',
          },
          {
            label: 'Letra B — pulso em intervalo longo',
            detail: 'Checagem espaçada demais — pausa excessiva nas compressões.',
            correct: 'Reavaliar pulso ~a cada 2 min, não a cada três minutos.',
          },
          {
            label: 'Letra D — só 100 compressões/min',
            detail: 'Omite faixa 100–120/min e profundidade 5–6 cm.',
            correct: '100–120/min, forte, com reexpansão torácica completa.',
          },
        ],
        footer_rule: 'Gabarito C — vasopressor na parada cardiorrespiratória',
      },
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-7': {
    family: 'protocolo',
    guideline: 'PCR intra-hospitalar — auxiliar: carrinho de urgência + tábua rígida',
    roi_error: 'rcp_auxiliar_carrinho_tabua',
    cluster: 'RCP intra-hospitalar — função do auxiliar na parada cardiorrespiratória',
    danger_footer: 'Auxiliar prepara material e tábua — não intuba nem prescreve — gabarito A',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR — papel do auxiliar',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'PCR intra-hospitalar — equipe multidisciplinar com funções definidas.',
            icon: 'Siren',
          },
          {
            label: 'Auxiliar de enfermagem',
            detail: 'Aproximar carrinho de urgência e posicionar tábua rígida para compressões eficazes.',
            icon: 'Package',
          },
          {
            label: 'Pegadinha — intubar',
            detail: 'Intubação é ato do médico/enfermeiro habilitado — não do auxiliar.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — prescrever',
            detail: 'Prescrição e decisão de cessar RCP não cabem ao auxiliar.',
            icon: 'ClipboardX',
          },
        ],
        footer_rule: 'Auxiliar = logística + compressões com tábua',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR intra-hospitalar — função do auxiliar de enfermagem?',
          'Eliminar intubar o paciente.',
          'Eliminar prescrever medicação.',
          'Eliminar determinar cessação da reanimação.',
          'Resta carrinho de urgência + tábua rígida no dorso.',
          'Marcar A.',
        ],
        footer_rule: 'Carrinho + tábua = compressão eficaz',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EQUIPE NA PCR',
        rows: rcpParamRows([
          { label: 'Auxiliar', value: 'Carrinho de urgência · tábua rígida · apoio logístico', badge: 'hot' },
          { label: 'Técnico/Enfermeiro', value: 'Compressões · SBV · monitorização', badge: 'ok' },
        ]),
        footer_rule: 'Função por nível de habilitação',
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-7': {
    family: 'protocolo',
    guideline: 'DEA — ritmos chocáveis: FV e taquicardia ventricular sem pulso (TVSP)',
    roi_error: 'dea_ritmos_chocaveis',
    cluster: 'RCP adulto — desfibrilação: FV e TVSP',
    danger_footer: 'DEA choca FV e TVSP — não assistolia/AESP isolados — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DEA — ritmos chocáveis',
        meta: slideMeta,
        items: [
          {
            label: 'Desfibrilação',
            detail: 'Corrente elétrica para reorganizar atividade elétrica cardíaca na parada cardiorrespiratória.',
            icon: 'Zap',
          },
          {
            label: 'Ritmos chocáveis',
            detail: 'Fibrilação ventricular (FV) e taquicardia ventricular sem pulso (TVSP).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — assistolia',
            detail: 'Assistolia não é ritmo chocável pelo DEA — compressões e drogas.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — AESP',
            detail: 'Atividade elétrica sem pulso — tratar causa, não desfibrilar isoladamente.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Desfibrilar só em FV/TVSP',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Desfibrilação pelo DEA — quais ritmos são chocáveis?',
          'Eliminar assistolia com FV (assistolia não choca).',
          'Eliminar FV com AESP como par chocável.',
          'Eliminar AESP com TVSP (AESP não é chocável).',
          'Resta fibrilação ventricular e taquicardia ventricular sem pulso.',
          'Marcar C.',
        ],
        footer_rule: 'FV + TVSP = desfibrilar imediatamente',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DEA — RITMOS',
        rows: [
          { label: 'Chocáveis', value: 'FV · TVSP (taquicardia ventricular sem pulso)', badge: 'hot' },
          { label: 'Não chocáveis', value: 'Assistolia · AESP · bradicardia com pulso', badge: 'warn' },
          { label: 'Após desfibrilação', value: 'Retomar compressões imediatamente', badge: 'ok' },
          { label: 'RCP', value: 'Compressões 100–120/min entre análises', badge: 'ok' },
        ],
        footer_rule: 'Seguir voz do DEA — minimizar pausa',
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'furb-enfermagem-processo-de-enfermagem-1780011915153-0': {
    B: '25:4 não é proporção padronizada AHA para adulto pré-VAA.',
    C: 'Proporção infantil — adulto usa 30:2 antes da via aérea avançada.',
    D: 'Quinze compressões também é infantil — não aplicar ao adulto desta questão.',
    E: '30:4 inventa ventilações — padrão é 30:2.',
  },
  'avancasp-enfermagem-urgencias-e-emergencias-1777103970505-1': {
    A: 'Tipo A não é ambulância de resgate nesta classificação MS.',
    C: 'Tipo C é suporte avançado — não ambulância de resgate básico.',
    D: 'Tipo A não é veículo exclusivo de atendimento de emergências.',
    E: 'Tipo C é avançado/UTI — suporte básico é Tipo B.',
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-1': {
    B: 'Pulso antes de comprimir atrasa SBV — C-A-B exige compressões primeiro.',
    C: 'DEA antes de compressões/VA inverte sequência AHA.',
    D: 'Desfibrilação imediata sem compressões iniciais — ordem errada.',
    E: 'Abrir via aérea antes de comprimir — não é C-A-B.',
  },
  'gama-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-7': {
    A: 'BVM a cada 6 s desconectando VM — não conduta para intubado nesta prova.',
    B: 'Manter parâmetros prévios sem modo controlado/FiO₂ adequados.',
    C: 'BVM assíncrona desconectando ventilador — incorreto.',
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-7': {
    B: 'Intubação não é função do auxiliar na PCR intra-hospitalar.',
    C: 'Prescrição é ato médico — fora do escopo do auxiliar.',
    D: 'Decisão de cessar RCP é médica — não do auxiliar.',
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104083571-7': {
    A: 'Assistolia não é ritmo chocável pelo DEA.',
    B: 'AESP não é ritmo chocável — tratar causa reversível.',
    D: 'AESP não choca — TVSP sim, mas par com AESP invalida.',
  },
  'funcern-enfermagem-urgencias-e-emergencias-1777104000896-4': {
    A: 'Falta o 6º elo recuperação na sequência intra-hospitalar completa.',
    B: 'Começa com segurança da cena — elo pré-hospitalar, não hospitalar.',
    D: 'Segurança da cena + ressuscitação avançada — ordem incorreta para intra-hospitalar.',
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
    console.log(`[handcraft:urgencias-g02] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g02] total=${ok}`);
}

main();
