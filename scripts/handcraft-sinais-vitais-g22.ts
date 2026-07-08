#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g22 (8 slugs P0 vitals_pa_tecnica pos 169–176).
 *
 *   npm run handcraft:sinais-vitais-g22
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g22';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'PA normotenso',
    'técnica de aferição PA',
    'manguito proporcional',
    'repouso pré-PA',
    'método oscilométrico',
    'materiais para SV',
    'classificação terminológica SV',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Branch =
  | 'vitals_pa_tecnica'
  | 'vitals_interpretacao'
  | 'vitals_fc_faixas'
  | 'vitals_generico';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  exam_vs_current?: string;
  roi_error?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'selecon-enfermagem-verificacao-de-sinais-vitais-1779344182672-3': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN/SBC — repouso ≥5 min sentado sem falar · evitar cafeína/tabaco/exercício antes da PA',
    exam_vs_current:
      'Prova SBC (2016) exige 60 min sem exercício vigoroso — intervalo não detalhado na guideline local',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-PA — intervalo pós-exercício',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'SBC (2016): tempo mínimo sem exercício físico antes da aferição adequada da pressão arterial.',
            icon: 'Target',
          },
          {
            label: 'Gabarito SBC',
            detail: 'Aguardar o intervalo mínimo sem atividade vigorosa — alternativa C.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — exercício recente',
            detail:
              'Letras A e B: intervalos curtos após atividade — exercício eleva PA e invalida repouso (SBC).',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — intervalo excessivo',
            detail: 'Letra D: além do mínimo exigido pela banca para esta prova.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Repouso pós-exercício — gabarito C (SBC)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: intervalo mínimo sem exercício físico (SBC 2016).',
          'Contexto: atividade vigorosa eleva PA e FC — aguardar antes de medir.',
          'Testar A — intervalo muito curto: insuficiente após esforço → eliminar.',
          'Testar B — intervalo intermediário: abaixo do gabarito SBC → eliminar.',
          'Testar C — intervalo exigido pela banca → candidata.',
          'Testar D — intervalo além do pedido → eliminar.',
          'Confirmar única alternativa alinhada à SBC.',
          'Marcar C.',
        ],
        footer_rule: 'Repouso pós-exercício → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo pré-PA',
        meta: slideMeta,
        content: 'DECORE — ANTES DE MEDIR',
        rows: [
          { label: 'Repouso imediato', value: '≥5 min sentado · ambiente calmo · sem falar', sv_kind: 'pa', badge: 'ok' },
          { label: 'Exercício vigoroso', value: 'Aguardar antes de medir — critério SBC desta questão', sv_kind: 'pa', badge: 'hot' },
          { label: 'Bexiga', value: 'Esvaziada — bexiga cheia eleva PA', sv_kind: 'meta', badge: 'ok' },
          { label: 'Tabaco/cafeína', value: 'Evitar 30 min antes da aferição', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Exercício recente distorce PA — aguardar 1 h',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-PA SELECON',
        items: [
          {
            label: 'Letra A — intervalo muito curto',
            detail: 'Intervalo muito curto após esforço.',
            correct:
              'Intervalo muito curto após esforço não normaliza PA — a banca exige aguardar o tempo do gabarito C.',
          },
          {
            label: 'Letra B — intervalo intermediário',
            detail: 'Metade do tempo da diretriz da prova.',
            correct:
              'Intervalo intermediário ainda é insuficiente segundo o critério SBC cobrado nesta questão.',
          },
          {
            label: 'Letra D — intervalo excessivo',
            detail: 'Parece mais rigoroso que o gabarito.',
            correct:
              'Ultrapassa o mínimo exigido pela prova — o gabarito marca a alternativa C, não um intervalo maior.',
          },
        ],
        footer_rule: 'Intervalo SBC → C',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1778969729218-0': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'COFEN/MS — materiais SV: termômetro, estetoscópio, esfigmomanômetro, álcool, algodão, relógio com ponteiros, luvas de procedimento',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Materiais — aferição de SV (Unesc)',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Materiais geralmente necessários para executar a aferição dos sinais vitais — assinalar a CORRETA.',
            icon: 'Target',
          },
          {
            label: 'Kit básico COFEN',
            detail:
              'Termômetro clínico, estetoscópio, esfigmomanômetro, álcool, algodão, relógio com ponteiros e luvas — letra B.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — sem termômetro',
            detail:
              'Letras A, C, D e E omitem termômetro — impossível aferir temperatura corporal com técnica adequada.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — UTI/urgência',
            detail: 'Letra A: bomba, respirador e laringoscópio — suporte avançado, não rotina SV.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — via aérea',
            detail: 'Letra D: intubação — procedimento invasivo distinto.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — medicação',
            detail: 'Letra E: equipo e seringa — administração de fármacos.',
            icon: 'Syringe',
          },
        ],
        footer_rule: 'SV básico = termômetro + PA + relógio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: materiais para aferição de sinais vitais.',
          'Listar núcleo: temperatura, PA, FC/FR (relógio), higiene (álcool/algodão), EPI (luvas).',
          'Testar A — bomba, respirador, laringoscópio: UTI → eliminar.',
          'Testar B — termômetro, estetoscópio, esfigmo, álcool, algodão, relógio, luvas: kit completo → candidata.',
          'Testar C — desfibrilador, ECG, laringoscópio: emergência cardíaca → eliminar.',
          'Testar D — laringoscópio e TOT: intubação → eliminar.',
          'Testar E — equipo macrogotas e seringa: medicação → eliminar.',
          'Marcar B.',
        ],
        footer_rule: 'Kit SV clássico → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — materiais por parâmetro',
        meta: slideMeta,
        content: 'DECORE — O QUE LEVAR AO LEITO',
        rows: [
          { label: 'Temperatura', value: 'Termômetro clínico', sv_kind: 'temp', badge: 'ok' },
          { label: 'Pressão arterial', value: 'Esfigmomanômetro + estetoscópio', sv_kind: 'pa', badge: 'ok' },
          { label: 'FC e FR', value: 'Relógio com ponteiros (segundos)', sv_kind: 'fc', badge: 'ok' },
          { label: 'Biossegurança', value: 'Álcool, algodão, luvas de procedimento', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Desfibrilador e laringoscópio não são de SV rotineiro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MATERIAIS UNESC',
        items: [
          {
            label: 'Letra A — bomba e respirador',
            detail: 'Equipamentos de suporte ventilatório e infusão.',
            correct:
              'Bomba de infusão, respirador e laringoscópio pertencem à terapia intensiva — não ao kit básico de aferição de sinais vitais.',
          },
          {
            label: 'Letra C — desfibrilador e ECG',
            detail: 'Monitorização cardíaca avançada.',
            correct:
              'Desfibrilador e eletrocardiógrafo são de emergência cardíaca — o técnico aferindo SV leva termômetro e esfigmomanômetro.',
          },
          {
            label: 'Letra D — tubo endotraqueal',
            detail: 'Material de intubação orotraqueal.',
            correct:
              'Laringoscópio, TOT e seringa de intubação são para via aérea avançada — não compõem aferição rotineira de SV.',
          },
          {
            label: 'Letra E — equipo macrogotas',
            detail: 'Material para infusão venosa.',
            correct:
              'Equipo, seringa grande e cuba rim são de administração de medicamentos — faltam termômetro e esfigmomanômetro.',
          },
        ],
        footer_rule: 'Só B lista o kit SV completo',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1779343801786-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — puerpério imediato: monitorar SV com vigilância estreita nas primeiras horas (hemorragia e choque)',
    exam_vs_current:
      'Prova cobra monitoramento nas primeiras 2–4 h — intervalo não detalhado na guideline local de faixas',
    roi_error: 'conduta_sem_escalonar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV maternos — puerpério imediato',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Frequência de monitoramento dos sinais vitais maternos nas primeiras horas após o parto.',
            icon: 'Target',
          },
          {
            label: 'Risco imediato',
            detail: 'Hemorragia e choque no puerpério — vigilância estreita.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Vigilância crítica',
            detail: 'Período imediato pós-parto exige monitoramento frequente — gabarito E.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — janela tardia',
            detail: 'Letras A e D: intervalos longos ignoram risco de hemorragia no puerpério imediato.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — temperatura omitida',
            detail:
              'Monitoramento materno inclui temperatura corporal — omitir aferição térmica no puerpério é erro técnico.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — rotina pediátrica estável',
            detail:
              'Aplicar intervalo espaçado de observação pediátrica — puérpera no puerpério imediato exige vigilância materna.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Puerpério imediato = 2–4 h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: frequência de SV maternos no pós-parto imediato.',
          'Contexto: hemorragia e choque podem surgir nas primeiras horas.',
          'Testar A — só após um dia: tardio para hemorragia → eliminar.',
          'Testar B — meio dia em diante: ignora pico de risco → eliminar.',
          'Testar C — faixa ampla imprecisa → eliminar.',
          'Testar D — vários dias de espera → eliminar.',
          'Testar E — vigilância no período crítico imediato → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Puerpério imediato → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vigilância puerperal',
        meta: slideMeta,
        content: 'MONITORAR NO PUERPÉRIO IMEDIATO',
        rows: [
          { label: 'Janela crítica', value: 'Puerpério imediato — hemorragia e choque', sv_kind: 'meta', badge: 'hot' },
          { label: 'Parâmetros', value: 'PA, FC, FR, temperatura, débito urinário', sv_kind: 'meta', badge: 'ok' },
          { label: 'Risco materno', value: 'Vigilância estreita — não rotina de enfermaria', sv_kind: 'meta', badge: 'warn' },
          { label: 'Após estabilizar', value: 'Intervalos ampliam conforme protocolo obstétrico', sv_kind: 'meta', badge: 'ok' },
        ],
        footer_rule: 'Quanto maior o risco, menor o intervalo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FREQUÊNCIA PUERPERAL',
        items: [
          {
            label: 'Letra A — só após um dia',
            detail: 'Monitorar tardiamente no puerpério.',
            correct:
              'Esperar um dia inteiro é tardio para detectar hemorragia no puerpério imediato — o risco concentra-se nas primeiras horas.',
          },
          {
            label: 'Letra B — meio dia em diante',
            detail: 'Início tardio do monitoramento.',
            correct:
              'Iniciar vigilância apenas após meio dia ignora o período de maior vulnerabilidade materna pós-parto.',
          },
          {
            label: 'Letra C — faixa ampla',
            detail: 'Intervalo impreciso e longo.',
            correct:
              'Faixa ampla de horas não corresponde ao protocolo de vigilância estreita do puerpério imediato.',
          },
          {
            label: 'Letra D — vários dias',
            detail: 'Espera inaceitável no pós-parto.',
            correct:
              'Adiar monitoramento por dias é inaceitável — hemorragia e choque exigem vigilância nas primeiras horas.',
          },
        ],
        footer_rule: 'Só E fecha 2–4 h',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1779344111854-4': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN — método oscilométrico: detecção automática por variações do manguito · sem estetoscópio · auscultatório usa sons Korotkoff',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Oscilométrico × auscultatório',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Sobre o método oscilométrico de avaliação da pressão arterial — assinalar o CORRETO.',
            icon: 'Target',
          },
          {
            label: 'Oscilométrico',
            detail:
              'Aparelho digital detecta oscilações do manguito — dispensa estetoscópio → letra A.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — posição manguito',
            detail: 'Letra B: descreve técnica auscultatória, não exclusiva do oscilométrico.',
            icon: 'Scale',
          },
          {
            label: 'Pegadinha — deflação manual',
            detail: 'Letra C: velocidade lenta de deflação — técnica auscultatória Korotkoff.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — sons Korotkoff',
            detail: 'Letras D e E: fases I e V — método auscultatório, não oscilométrico.',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'Oscilométrico = sem estetoscópio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre método oscilométrico.',
          'Diferenciar: oscilométrico (automático) × auscultatório (Korotkoff).',
          'Testar A — dispensado estetoscópio: característica do digital → candidata.',
          'Testar B — manguito 2–3 cm acima da fossa: técnica geral, não distintiva → eliminar.',
          'Testar C — deflação lenta constante: manual auscultatório → eliminar.',
          'Testar D — sistólica no primeiro som: Korotkoff fase I → eliminar.',
          'Testar E — diastólica no desaparecimento: fase V auscultatória → eliminar.',
          'Marcar A.',
        ],
        footer_rule: 'Digital não usa estetoscópio → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — duas técnicas de PA',
        meta: slideMeta,
        content: 'COMPARE OS MÉTODOS',
        rows: [
          { label: 'Oscilométrico', value: 'Sensor no manguito · sem ausculta', sv_kind: 'pa', badge: 'hot' },
          { label: 'Auscultatório', value: 'Estetoscópio + sons Korotkoff', sv_kind: 'pa', badge: 'ok' },
          { label: 'Sistólica manual', value: 'Primeiro som (fase I)', sv_kind: 'pa', badge: 'ok' },
          { label: 'Deflação manual', value: 'Velocidade lenta e constante — auscultatório', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Korotkoff pertence ao auscultatório — não ao digital',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — OSCILOMÉTRICO UNESC',
        items: [
          {
            label: 'Letra B — manguito na braquial',
            detail: 'Posicionamento do manguito sobre artéria braquial.',
            correct:
              'Embora o manguito deva cobrir a braquial, essa descrição vale para ambos os métodos — não é característica exclusiva do oscilométrico.',
          },
          {
            label: 'Letra C — deflação lenta constante',
            detail: 'Velocidade de deflação manual.',
            correct:
              'Deflação lenta e constante é técnica do método auscultatório manual — aparelho digital regula automaticamente.',
          },
          {
            label: 'Letra D — primeiro som = sistólica',
            detail: 'Critério Korotkoff fase I.',
            correct:
              'Pressão sistólica no primeiro som audível é definição auscultatória — oscilométrico detecta oscilações, não sons.',
          },
          {
            label: 'Letra E — desaparecimento = diastólica',
            detail: 'Critério Korotkoff fase V.',
            correct:
              'Diastólica no desaparecimento total dos sons é fase V do método auscultatório — incompatível com oscilométrico.',
          },
        ],
        footer_rule: 'Só A descreve o digital',
      },
    ],
  },

  'unesc-enfermagem-verificacao-de-sinais-vitais-1780000468214-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'COFEN/MS — materiais SV: termômetro, estetoscópio, esfigmomanômetro, álcool, algodão, relógio com ponteiros, luvas de procedimento',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Kit de SV — equipe de enfermagem',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Materiais necessários para aferir sinais vitais — analisar alternativas e assinalar a correta.',
            icon: 'Target',
          },
          {
            label: 'Resposta B',
            detail:
              'Termômetro, estetoscópio, esfigmomanômetro, álcool, algodão, relógio com ponteiros e luvas de procedimento.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha — sem termômetro',
            detail:
              'Letras A, C, D e E não incluem termômetro clínico — impossível aferir temperatura corporal.',
            icon: 'Thermometer',
          },
          {
            label: 'Distrator UTI',
            detail: 'Letra A: ventilação mecânica — fora do escopo SV de rotina.',
            icon: 'Ban',
          },
          {
            label: 'Distrator cardíaco',
            detail: 'Letra C: DEA e ECG — emergência, não aferição básica.',
            icon: 'HeartPulse',
          },
          {
            label: 'Distrator medicação',
            detail: 'Letra E: equipo e seringa — via venosa, não termometria.',
            icon: 'Syringe',
          },
        ],
        footer_rule: 'Aferição básica → termômetro + esfigmo + relógio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: materiais para procedimento de aferição de SV.',
          'Mapear parâmetros: temp (termômetro), PA (esfigmo + estetoscópio), FC/FR (relógio).',
          'Incluir higiene e EPI: álcool, algodão, luvas de procedimento.',
          'Testar A — bomba, respirador, laringoscópio: suporte avançado → eliminar.',
          'Testar B — kit completo listado: todos os itens SV → candidata.',
          'Testar C, D, E — sem termômetro/esfigmo ou com material de UTI → eliminar.',
          'Confirmar única lista completa.',
          'Marcar B.',
        ],
        footer_rule: 'Lista COFEN completa → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — checklist SV',
        meta: slideMeta,
        content: 'ITENS OBRIGATÓRIOS NA BANCADA',
        rows: [
          { label: 'Temperatura', value: 'Termômetro clínico', sv_kind: 'temp', badge: 'ok' },
          { label: 'Pressão', value: 'Esfigmomanômetro + estetoscópio', sv_kind: 'pa', badge: 'ok' },
          { label: 'Pulso/respiração', value: 'Relógio com ponteiros', sv_kind: 'fc', badge: 'ok' },
          { label: 'Higiene/EPI', value: 'Álcool 70%, algodão, luvas de procedimento', sv_kind: 'meta', badge: 'hot' },
        ],
        footer_rule: 'Laringoscópio e desfibrilador não entram no kit SV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — KIT SV UNESC (2ª)',
        items: [
          {
            label: 'Letra A — suporte ventilatório',
            detail: 'Bomba de infusão, respirador e laringoscópio.',
            correct:
              'Equipamentos de ventilação e infusão contínua são de terapia intensiva — não substituem termômetro e esfigmomanômetro na aferição de SV.',
          },
          {
            label: 'Letra C — monitor cardíaco',
            detail: 'Desfibrilador, ECG e laringoscópio.',
            correct:
              'Desfibrilador e eletrocardiógrafo monitoram ritmo cardíaco em emergência — faltam os instrumentos básicos de temperatura e pressão.',
          },
          {
            label: 'Letra D — intubação',
            detail: 'Laringoscópio, TOT e seringa estéril.',
            correct:
              'Material de intubação orotraqueal é procedimento de via aérea — não compõe o rol de materiais para aferir sinais vitais.',
          },
          {
            label: 'Letra E — infusão venosa',
            detail: 'Equipo macrogotas, seringa grande, cuba rim.',
            correct:
              'Equipo e seringa servem à administração de medicamentos — a lista correta inclui termômetro e esfigmomanômetro.',
          },
        ],
        footer_rule: 'B é a única lista SV completa',
      },
    ],
  },

  'unifil-enfermagem-verificacao-de-sinais-vitais-1779344196733-0': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/COFEN/SBC — repouso 3–5 min calmo obrigatório · manguito 2–3 cm acima da fossa · PA ortostática em idosos/diabéticos · crianças ≥ 3 anos',
    exam_vs_current:
      'Item VI cita intervalo trienal para PA ≤ 120/80 — diretriz pode diferir; slides seguem gabarito D (VI falsa)',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica PA (7ª Diretriz)',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Seis assertivas sobre mensuração da PA (7ª Diretriz Brasileira) — julgar e achar combinação correta.',
            icon: 'Target',
          },
          {
            label: 'Afirmativa I — crianças ≥ 3 anos',
            detail: 'PA anual após 3 anos no atendimento pediátrico → VERDADEIRA.',
            icon: 'Baby',
          },
          {
            label: 'Afirmativa II — manguito',
            detail: '2–3 cm acima da fossa, sem folgas → VERDADEIRA.',
            icon: 'Scale',
          },
          {
            label: 'Afirmativa III — repouso',
            detail: 'Afirma que repouso 3–5 min não é necessário → FALSA.',
            icon: 'Clock',
          },
          {
            label: 'Afirmativa IV — posição',
            detail: 'Sentado, pernas descruzadas, pés no chão, dorso apoiado → VERDADEIRA.',
            icon: 'Armchair',
          },
          {
            label: 'Afirmativa V — ortostática',
            detail: 'PA em pé após 3 min em idosos/diabéticos → VERDADEIRA.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'I, II, IV, V verdadeiras · III e VI falsas → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F — julgar assertivas I a VI.',
          'Julgar I — PA em crianças ≥ 3 anos anualmente: correto → VERDADEIRO.',
          'Julgar II — manguito 2–3 cm acima da fossa: correto → VERDADEIRO.',
          'Julgar III — repouso 3–5 min desnecessário: SBC exige repouso → FALSO.',
          'Julgar IV — posição sentada adequada: correto → VERDADEIRO.',
          'Julgar V — PA ortostática em grupos de risco: correto → VERDADEIRO.',
          'Julgar VI — intervalo trienal para ≤ 120/80: gabarito marca falso → FALSO.',
          'Combinação I, II, IV, V → marcar D.',
        ],
        footer_rule: 'Repouso é obrigatório — III falsa → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — assertivas falsas (V/F)',
        meta: slideMeta,
        content: 'DECORE — TÉCNICA 7ª DIRETIZ PA',
        rows: [
          { label: 'Repouso pré-PA', value: '3–5 min sentado · ambiente calmo — não dispensável', sv_kind: 'pa', badge: 'hot' },
          { label: 'Manguito', value: '2–3 cm acima da fossa cubital · sem folgas', sv_kind: 'pa', badge: 'ok' },
          { label: 'Rastreio pressórico', value: 'Intervalo conforme nível de PA do adulto', sv_kind: 'pa', badge: 'ok' },
          { label: 'PA ortostática', value: 'Em pé após 3 min — diabéticos e idosos', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'III nega repouso — única pegadinha técnica central',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F UNIFIL',
        items: [
          {
            label: 'Letra A — inclui VI',
            detail: 'Marca II, IV, V e VI como corretas.',
            correct:
              'Assertiva VI está falsa no gabarito — intervalo trienal para PA ≤ 120/80 não fecha a combinação correta.',
          },
          {
            label: 'Letra B — omite IV',
            detail: 'Lista I, II, V e VI — exclui posição sentada.',
            correct:
              'Quarta assertiva (posição do paciente) é verdadeira — alternativa B a exclui indevidamente e inclui VI falsa.',
          },
          {
            label: 'Letra C — só IV e V',
            detail: 'Ignora I e II verdadeiras.',
            correct:
              'Primeira e segunda assertivas são verdadeiras — PA pediátrica e posicionamento do manguito não podem ser omitidas.',
          },
        ],
        footer_rule: 'Só D = I, II, IV, V',
      },
    ],
  },

  'univali-enfermagem-verificacao-de-sinais-vitais-1779343932809-0': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline:
      'COFEN/MS — núcleo mínimo de SV: frequência cardíaca, frequência respiratória, temperatura e pressão arterial',
    roi_error: 'vitals_concept_generic_sv',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parâmetros mínimos de SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Parâmetros mínimos a aferir para obtenção dos sinais vitais — alternativa CORRETA.',
            icon: 'Target',
          },
          {
            label: 'Quarteto clássico',
            detail: 'FC, FR, temperatura e PA — alternativa A.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha — dor no lugar de FR',
            detail: 'Letra B: troca FR por escore de dor — quinto sinal, não núcleo mínimo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — glicemia',
            detail: 'Letra C: inclui glicemia capilar — parâmetro metabólico.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — SpO₂ e dor',
            detail: 'Letra D: oximetria e dor — complementares ao núcleo de 4.',
            icon: 'Wind',
          },
        ],
        footer_rule: 'Mínimo = FC + FR + temp + PA',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: parâmetros mínimos dos sinais vitais.',
          'Lembrar núcleo COFEN: FC, FR, temperatura, PA.',
          'Testar A — FC, FR, temperatura e PA: quarteto clássico → candidata.',
          'Testar B — temperatura, PA e dor: falta FC e FR → eliminar.',
          'Testar C — FC, FR e glicemia: falta PA e temperatura → eliminar.',
          'Testar D — SpO₂, dor, PA e temperatura: falta FC e FR → eliminar.',
          'Confirmar única lista completa dos quatro.',
          'Marcar A.',
        ],
        footer_rule: 'Quatro clássicos → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — núcleo COFEN',
        meta: slideMeta,
        content: 'DECORE — MÍNIMO DE 4',
        rows: [
          { label: 'FC', value: 'Frequência cardíaca (bpm)', sv_kind: 'fc', badge: 'ok' },
          { label: 'FR', value: 'Frequência respiratória (irpm)', sv_kind: 'fr', badge: 'ok' },
          { label: 'Temperatura', value: 'Corporal (°C)', sv_kind: 'temp', badge: 'ok' },
          { label: 'PA', value: 'Pressão arterial (mmHg)', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Dor e SpO₂ são complementares — não substituem FC/FR',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO UNIVALI',
        items: [
          {
            label: 'Letra B — dor no lugar de FR',
            detail: 'Lista temperatura, PA e dor.',
            correct:
              'Escore de dor é o 5º sinal vital na COFEN — o mínimo exige FC e FR, que esta alternativa omite.',
          },
          {
            label: 'Letra C — glicemia capilar',
            detail: 'Substitui PA e temperatura por glicemia.',
            correct:
              'Glicemia capilar é monitorização metabólica — não integra o núcleo mínimo de quatro sinais vitais.',
          },
          {
            label: 'Letra D — SpO₂ e dor',
            detail: 'Oximetria no lugar de FC e FR.',
            correct:
              'SpO₂ e dor são parâmetros complementares — o mínimo obrigatório inclui frequência cardíaca e respiratória.',
          },
        ],
        footer_rule: 'Só A lista os quatro clássicos',
      },
    ],
  },

  'univali-enfermagem-verificacao-de-sinais-vitais-1779343932809-1': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline:
      'MS/SBC — PA domiciliar digital: braço na altura do coração · silêncio e repouso · manguito 2–3 cm acima da fossa · pés apoiados',
    roi_error: 'manguito_inadequado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — PA digital em casa',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Orientação ao paciente sobre PA domiciliar com aparelho digital — marcar a que NÃO é correta.',
            icon: 'Target',
          },
          {
            label: 'Exceção — conversar na medição',
            detail:
              'Letra B: falar durante a aferição distorce a leitura — é a INCORRETA.',
            icon: 'Ban',
          },
          {
            label: 'Conduta A — braço apoiado',
            detail: 'Braço na altura do coração sobre superfície firme — orientação correta.',
            icon: 'Scale',
          },
          {
            label: 'Conduta C — manguito',
            detail: '2–3 cm acima da fossa, direto na pele — orientação correta.',
            icon: 'Activity',
          },
          {
            label: 'Conduta D — posição sentada',
            detail: 'Costas apoiadas e pés no chão — orientação correta.',
            icon: 'Armchair',
          },
        ],
        footer_rule: 'Silêncio na medição — conversar é erro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa que NÃO representa orientação correta (INCORRETA).',
          'Formato EXCETO — três letras são condutas certas; uma é o erro.',
          'Testar A — braço na altura do coração: técnica correta → não é resposta.',
          'Testar B — conversar durante medição: eleva PA e move braço → INCORRETA.',
          'Testar C — manguito 2–3 cm acima da fossa na pele: correto → não é resposta.',
          'Testar D — sentado com costas e pés apoiados: correto → não é resposta.',
          'Confirmar única orientação inadequada.',
          'Marcar B.',
        ],
        footer_rule: 'Falar na medição → B (INCORRETA)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — automedida PA',
        meta: slideMeta,
        content: 'ORIENTE O PACIENTE EM CASA',
        rows: [
          { label: 'Posição', value: 'Sentado · costas apoiadas · pés no chão', sv_kind: 'pa', badge: 'ok' },
          { label: 'Braço', value: 'Apoiado na altura do coração', sv_kind: 'pa', badge: 'ok' },
          { label: 'Manguito', value: '2–3 cm acima da fossa · pele nua', sv_kind: 'pa', badge: 'ok' },
          { label: 'Durante medição', value: 'Silêncio e imobilidade — não conversar', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Conversar eleva PA e invalida a leitura',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO PA DOMICILIAR',
        items: [
          {
            label: 'Letra A — braço na altura do coração',
            detail: 'Apoio firme alinhado ao átrio.',
            correct:
              'Braço apoiado na altura do coração é conduta correta — alinha o manguito hemodinamicamente e não é a exceção pedida.',
          },
          {
            label: 'Letra C — manguito na pele',
            detail: 'Posicionamento 2–3 cm acima da fossa.',
            correct:
              'Manguito direto na pele, 2–3 cm acima da fossa antecubital, é técnica correta de automedida — não é a orientação incorreta.',
          },
          {
            label: 'Letra D — sentado confortável',
            detail: 'Costas e pés apoiados.',
            correct:
              'Sentar com costas apoiadas e pés no chão é postura recomendada pela SBC — conduta correta, não a resposta EXCETO.',
          },
        ],
        footer_rule: 'Só B é orientação errada',
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
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g22] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g22] total=${ok}`);
}

main();
