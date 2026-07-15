#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g02 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g02.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g02 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g02 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g02';
const SUBTOPICO = 'Saúde da Criança';
const REVIEWED = '2026-07-15';

const MS_CADERNETA_SOURCE = {
  id: SAUDE_CRIANCA_MS.id,
  tier: 'A' as const,
  issuer: SAUDE_CRIANCA_MS.issuer,
  title: SAUDE_CRIANCA_MS.title,
  year: SAUDE_CRIANCA_MS.year,
  url: SAUDE_CRIANCA_MS.url,
  covers: [
    'teste do coraçãozinho',
    'triagem neonatal',
    'aleitamento materno',
    'conservação leite materno',
    'desenvolvimento infantil',
    'TEA',
    'SDR neonatal',
    'classificação RN alto risco',
    'SpO₂ 95%',
    'diferença 3%',
    'geladeira 12 horas',
    'baixo peso 2500 g',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_triagem_neonatal'
  | 'crianca_aleitamento_nutricao'
  | 'crianca_aps_puericultura'
  | 'crianca_desenvolvimento'
  | 'crianca_desidratacao'
  | 'crianca_apgar_reanimacao';

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_CADERNETA_SOURCE)[];
  exam_vs_current?: string;
  slides: unknown[];
  cleanInstruction?: (s: string) => string;
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
    },
    sources: pack.sources ?? [MS_CADERNETA_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/deSaúde/gi, 'de Saúde')
    .replace(/dehábitos/gi, 'de hábitos')
    .replace(/assertivassobre/gi, 'assertivas sobre')
    .replace(/oAgente/gi, 'o Agente')
    .replace(/tempoecom/gi, 'tempo e com')
    .replace(/Ossinais/gi, 'Os sinais')
    .replace(/oclassifique/gi, 'o classifique')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'cotec-fadenor-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1776056694842-5': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Teste do coraçãozinho — oximetria neonatal (MS/SUS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Teste do coraçãozinho',
        meta: slideMeta,
        items: [
          { label: 'O que é', detail: 'Oximetria de pulso no RN — antes da alta hospitalar.', icon: 'HeartPulse' },
          { label: 'Quando', detail: 'Antes da alta — extremidades aquecidas.', icon: 'Clock' },
          { label: 'Critério anormal', detail: 'SpO₂ <95% em qualquer medida ou diferença ≥3% entre medidas.', icon: 'Activity' },
          { label: 'Pegadinha', detail: 'Banca troca limiares próximos de noventa e cinco por cento.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Coraçãozinho: SpO₂ <95% ou Δ≥3%',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: resultado anormal no teste do coraçãozinho (oxímetro de pulso).',
          'Recém-nascido aparentemente saudável — idade gestacional mínima do protocolo.',
          'Antes da alta — extremidades aquecidas e onda pulsátil.',
          'Eliminar alternativas com cortes muito baixos (sessenta por cento, setenta por cento).',
          'Eliminar alternativa com limiar noventa e oito por cento — alto demais.',
          'Testar C: SpO₂ menor que 95% ou diferença igual ou maior que 3%.',
          'Marcar letra C.',
          'Fixação: cardiopatia congênita crítica → SpO₂ baixa ou assimetria.',
        ],
        footer_rule: 'Anormal = SpO₂ abaixo de 95% ou diferença de 3% ou mais',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coraçãozinho — referência',
        meta: slideMeta,
        content: 'OXIMETRIA NEONATAL',
        rows: [
          { label: 'Janela', value: 'Antes da alta hospitalar', badge: 'ok' },
          { label: 'SpO₂ normal', value: '≥95% pré e pós-ductal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Diferença', value: '≥3% entre medidas = anormal', badge: 'warn' },
          { label: 'Conduta', value: 'Repetir e encaminhar se alterado', badge: 'info' },
        ],
        footer_rule: 'Triagem cardíaca neonatal — não confundir com pezinho',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CORAÇÃOZINHO',
        items: [
          {
            label: 'Letra A — SpO₂ muito baixa',
            detail: 'Corte extremamente baixo — RN já estaria em choque.',
            correct: 'Critério da prova: abaixo de 95% ou diferença de 3% ou mais.',
          },
          {
            label: 'Letra B — SpO₂ noventa e oito por cento',
            detail: 'Exige saturação quase perfeita como normal.',
            correct: 'Anormal é abaixo de 95% — noventa e oito por cento é limiar irreal.',
          },
          {
            label: 'Letra D — SpO₂ noventa e dois por cento',
            detail: 'Valor intermediário para confundir com noventa e cinco.',
            correct: 'Gabarito C: limiar é noventa e cinco por cento — não noventa e dois.',
          },
          {
            label: 'Letra E — SpO₂ setenta por cento',
            detail: 'Hipoxemia grave — não é o corte de triagem.',
            correct: 'Triagem usa abaixo de 95% ou diferença entre extremidades.',
          },
        ],
        footer_rule: 'Decore 95% e diferença 3%',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cotec-fadenor-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344637595-7': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Portaria MS 1.940/2018 — teste do coraçãozinho (SIGTAP)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Portaria 1.940/2018',
        meta: slideMeta,
        items: [
          { label: 'Procedimento SUS', detail: 'Oximetria de pulso no RN — incluído no SIGTAP.', icon: 'FileText' },
          { label: 'População', detail: 'RN aparentemente saudável — primeiras 24–48 h de vida.', icon: 'Baby' },
          { label: 'Falha', detail: 'SpO₂ <95% ou diferença ≥3% entre medidas.', icon: 'HeartPulse' },
          { label: 'Pegadinha duplicada', detail: 'Alternativas B e E parecem iguais — ler diferença de redação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'SIGTAP: oximetria neonatal universal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: critério de resultado anormal (Portaria nº 1.940/2018 — SIGTAP).',
          'Procedimento: aferição da saturação de oxigênio com oxímetro de pulso.',
          'Recém-nascido aparentemente saudável — idade gestacional mínima do protocolo.',
          'Eliminar A e C (90%): corte abaixo do protocolo vigente.',
          'Eliminar D (80%): hipoxemia grave — não é limiar de triagem.',
          'Eliminar B: redação incompleta em relação ao gabarito.',
          'Testar E: SpO₂ menor que 95% ou diferença igual ou maior que 3%.',
          'Marcar letra E.',
        ],
        footer_rule: 'Portaria 1.940: SpO₂ abaixo de 95% ou diferença ≥3%',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coraçãozinho — SIGTAP',
        meta: slideMeta,
        content: 'PORTARIA 1.940/2018',
        rows: [
          { label: 'Procedimento', value: 'Oximetria de pulso neonatal', badge: 'hot' },
          { label: 'Anormal', value: 'SpO₂ <95% ou Δ≥3%', badge: 'warn', emphasis: 'highlight' },
          { label: 'Momento', value: 'Antes da alta — 24–48 h', badge: 'ok' },
          { label: 'Técnica', value: 'Extremidades aquecidas, onda pulsátil', badge: 'info' },
        ],
        footer_rule: 'Triagem cardíaca = coraçãozinho no SUS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PORTARIA',
        items: [
          {
            label: 'Letra A — SpO₂ <90%',
            detail: 'Corte mais baixo que o protocolo de triagem.',
            correct: 'Anormal na portaria: <95% ou diferença ≥3%.',
          },
          {
            label: 'Letra B — SpO₂ <95%',
            detail: 'Parece correta, mas redação da E é a completa da banca.',
            correct: 'Gabarito E inclui também diferença ≥3% entre medidas.',
          },
          {
            label: 'Letra C — SpO₂ <90% (repetida)',
            detail: 'Distrator duplicado com variação de texto.',
            correct: 'Limiar é 95% — não 90%.',
          },
          {
            label: 'Letra D — SpO₂ <80%',
            detail: 'Hipoxemia crítica — não critério de triagem.',
            correct: 'Triagem neonatal usa <95% ou assimetria ≥3%.',
          },
        ],
        footer_rule: 'B parece certa — E é a redação gabarito',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-nutricao-aplicada-a-enfermagem-1777102879099-8': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Conservação e descongelamento do leite materno (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Leite materno ordenhado',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Joana amamenta primogênita de 5 meses — palestra na UBS sobre conservação.', icon: 'Briefcase' },
          { label: 'Ordenha', detail: 'Descongelamento e aquecimento sem ferver o leite materno.', icon: 'Refrigerator' },
          { label: 'Geladeira', detail: 'Prazo de validade de 12 horas quando guardado refrigerado.', icon: 'Clock' },
          { label: 'Frasco', detail: 'Congelar no freezer logo após coleta — não misturar ordenhas.', icon: 'Snowflake' },
        ],
        footer_rule: 'Ordenha segura: higiene + prazo + descongelar sem ferver',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientação CORRETA sobre conservação do leite materno.',
          'Eliminar A: completar frasco com outra coleta — contamina e altera validade.',
          'Eliminar B: validade no freezer — prazo da prova não é o citado.',
          'Eliminar D: misturar coletas no mesmo frasco — invalida prazo.',
          'Eliminar E: ferver para descongelar — destrói fatores do leite.',
          'Testar C: geladeira — validade de 12 horas conforme enunciado.',
          'Marcar letra C.',
          'Fixação: descongelar em banho-maria ou geladeira — nunca ferver.',
        ],
        footer_rule: 'Geladeira 12 h na prova · não ferver',
      },
      {
        type: 'golden_rule',
        slide_title: 'Armazenamento — leite materno',
        meta: slideMeta,
        content: 'CONSERVAÇÃO MS',
        rows: [
          { label: 'Geladeira (prova)', value: '12 horas', badge: 'hot', emphasis: 'highlight' },
          { label: 'Congelador', value: 'Congelar logo após coleta', badge: 'ok' },
          { label: 'Descongelar', value: 'Geladeira ou água morna — sem ferver', badge: 'warn' },
          { label: 'Frasco', value: 'Uma coleta por frasco — não misturar', badge: 'info' },
        ],
        footer_rule: 'Higiene + prazo + técnica de descongelamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LEITE ORDENHADO',
        items: [
          {
            label: 'Letra A — completar frasco',
            detail: 'Mistura coletas de horários diferentes.',
            correct: 'Cada coleta em frasco próprio — não completar com outra ordenha.',
          },
          {
            label: 'Letra B — validade no freezer',
            detail: 'Prazo incorreto para a orientação pedida.',
            correct: 'Gabarito C: geladeira 12 h — não confundir com freezer.',
          },
          {
            label: 'Letra D — misturar coletas',
            detail: 'Estende validade indevidamente.',
            correct: 'Validade conta da coleta mais antiga — não misturar no mesmo frasco.',
          },
          {
            label: 'Letra E — ferver para descongelar',
            detail: 'Destrói imunoglobulinas e fatores anti-infecciosos.',
            correct: 'Descongelar sem ferver — banho-maria ou geladeira.',
          },
        ],
        footer_rule: 'Nunca ferver leite materno',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-3': {
    family: 'conceito',
    branch: 'crianca_aps_puericultura',
    guideline: 'AIDPI Criança 2 meses–5 anos — marcos do desenvolvimento (MS 2017)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Marcos — 3 anos (AIDPI)',
        meta: slideMeta,
        items: [
          { label: 'Visita domiciliar', detail: 'Observar interação e habilidades globais na APS.', icon: 'Home' },
          { label: 'Referência', detail: 'Manual AIDPI — marcos por faixa etária.', icon: 'BookOpen' },
          { label: '3 anos', detail: 'Imita linha vertical e reconhece duas ações.', icon: 'Pencil' },
          { label: 'Pegadinha', detail: 'Marcos de 4–5 anos (pular, vestir-se) em criança de 3.', icon: 'AlertTriangle' },
        ],
        footer_rule: '3 anos: linha vertical + duas ações',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: dois marcos corretos para criança de 3 anos (AIDPI).',
          'Eliminar A: polegar com mão fechada e cruz — marcos mais precoces.',
          'Eliminar C: escovar dentes e equilíbrio 5 s — marcos de idade maior.',
          'Eliminar D: emparelhar cores e pular um pé — 4–5 anos.',
          'Eliminar E: linha mais comprida e vestir-se — além dos 3 anos.',
          'Testar B: imita linha vertical e reconhece duas ações.',
          'Marcar letra B.',
          'Fixação: AIDPI na visita domiciliar — comparar marcos à idade.',
        ],
        footer_rule: 'B = marcos típicos dos 3 anos',
      },
      {
        type: 'golden_rule',
        slide_title: 'Desenvolvimento — 3 anos',
        meta: slideMeta,
        content: 'AIDPI — MARCOS',
        rows: [
          { label: '3 anos', value: 'Linha vertical + reconhece 2 ações', badge: 'hot', emphasis: 'highlight' },
          { label: '2 anos', value: 'Cruz, duas palavras, chute bola', badge: 'info' },
          { label: '4–5 anos', value: 'Pular, vestir-se, emparelhar cores', badge: 'ok' },
          { label: 'Alerta', value: 'Atraso de marcos → investigar', badge: 'warn' },
        ],
        footer_rule: 'Marcos por idade — não antecipar nem atrasar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MARCOS 3 ANOS',
        items: [
          {
            label: 'Letra A — polegar e cruz',
            detail: 'Marcos de 18–24 meses, não 3 anos.',
            correct: 'Aos 3 anos: linha vertical e reconhecer duas ações.',
          },
          {
            label: 'Letra C — escovar dentes sem ajuda',
            detail: 'Habilidade de autocuidado mais tardia.',
            correct: 'Marcos dos 3 anos incluem imitar linha vertical — não escovação independente.',
          },
          {
            label: 'Letra D — emparelhar cores e pular',
            detail: 'Habilidades típicas de 4–5 anos.',
            correct: 'Criança de 3 anos: B (linha vertical + duas ações).',
          },
          {
            label: 'Letra E — vestir-se sem ajuda',
            detail: 'Marco de pré-escolar mais velho.',
            correct: 'AIDPI 3 anos: gabarito B — não vestir-se sozinha.',
          },
        ],
        footer_rule: 'Não colocar marco de 5 anos em criança de 3',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780007238824-4': {
    family: 'vf',
    branch: 'crianca_desenvolvimento',
    guideline: 'Linha de Cuidado TEA — MS (vigilância e intervenção precoce)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TEA na infância — MS',
        meta: slideMeta,
        items: [
          { label: 'Intervenção precoce', detail: 'TEA: iniciar apoio antes da confirmação — neuroplasticidade.', icon: 'Brain' },
          { label: 'Linha MS', detail: 'Transtorno do Espectro Autista — vigilância na infância.', icon: 'Stethoscope' },
          { label: 'M-CHAT-R', detail: 'Rastreio 16–30 meses — não exclusivo de especialista.', icon: 'ClipboardList' },
          { label: 'Diagnóstico', detail: 'Comportamental — sem marcador laboratorial (IV verdadeira).', icon: 'Search' },
        ],
        footer_rule: 'TEA: intervenção precoce + diagnóstico comportamental',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: Linha de Cuidado para Atenção às Pessoas com Transtorno do Espectro Autista (TEA).',
          'I — intervenções comportamentais e apoio educacional precoce: VERDADEIRA.',
          'II — diagnóstico somente após 4 anos: FALSA.',
          'III — M-CHAT-R exclusivo de serviço especializado: FALSA.',
          'IV — sem exame laboratorial, diagnóstico comportamental: VERDADEIRA.',
          'V — comprometimento cognitivo obrigatório no TEA: FALSA.',
          'Corretas: I e IV apenas.',
          'Marcar letra A.',
        ],
        footer_rule: 'Só I e IV — A',
      },
      {
        type: 'golden_rule',
        slide_title: 'TEA — referência MS',
        meta: slideMeta,
        content: 'LINHA DE CUIDADO TEA',
        rows: [
          { label: 'Intervenção', value: 'Precoce, mesmo sem confirmação — I', badge: 'hot' },
          { label: 'Diagnóstico', value: 'Comportamental — sem marcador — IV', badge: 'ok' },
          { label: 'M-CHAT-R', value: '16–30 meses — APS pode aplicar', badge: 'info' },
          { label: 'Cognição', value: 'Não obrigatória no TEA — V falsa', badge: 'warn' },
        ],
        footer_rule: 'Não atrasar intervenção esperando os 4 anos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TEA (V/F)',
        items: [
          {
            label: 'Letra B — I, II e III',
            detail: 'Aceita diagnóstico tardio e M-CHAT exclusivo.',
            correct: 'II e III são falsas — intervenção precoce e rastreio na APS.',
          },
          {
            label: 'Letra C — I, II, III e V',
            detail: 'Inclui comprometimento cognitivo obrigatório.',
            correct: 'V é falsa — TEA não exige déficit cognitivo.',
          },
          {
            label: 'Letra D — I, III e V',
            detail: 'Mantém M-CHAT restrito e cognição obrigatória.',
            correct: 'Só I e IV são verdadeiras.',
          },
          {
            label: 'Letra E — III, IV e V',
            detail: 'Omite intervenção precoce (I).',
            correct: 'I e IV corretas — não III nem V.',
          },
        ],
        footer_rule: 'II, III e V são falsas',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-3': {
    family: 'vf',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Saúde bucal na primeira infância + AME (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saúde bucal + amamentação',
        meta: slideMeta,
        items: [
          { label: 'ACS', detail: 'Agente Comunitário de Saúde orienta saúde bucal na amamentação.', icon: 'Users' },
          { label: 'AME', detail: 'Estimular aleitamento materno exclusivo até seis meses de vida.', icon: 'Baby' },
          { label: 'Chupeta', detail: 'Orientar para não dar chupeta à criança.', icon: 'Ban' },
          { label: 'Mamadeira', detail: 'Não aumentar orifício do bico — prejudica sucção e bucal.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'AME 6 meses · sem chupeta · higiene bucal desde o início',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: orientações de saúde bucal na fase de amamentação.',
          'I — AME exclusivo até 6 meses: VERDADEIRA.',
          'II — não dar chupeta: VERDADEIRA.',
          'III — aumentar orifício da mamadeira: FALSA.',
          'IV — dispensar higiene bucal à noite: FALSA.',
          'Corretas: I e II apenas.',
          'Marcar letra E.',
        ],
        footer_rule: 'Corretas: I (AME 6 meses) e II (sem chupeta) — letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Saúde bucal infantil',
        meta: slideMeta,
        content: 'ORIENTAÇÕES ACS',
        rows: [
          { label: 'AME', value: 'Exclusivo até 6 meses — I', badge: 'hot' },
          { label: 'Chupeta', value: 'Não oferecer — II', badge: 'ok' },
          { label: 'Mamadeira', value: 'Não ampliar bico — III falsa', badge: 'warn' },
          { label: 'Higiene', value: 'Limpar gengiva/língua — inclusive à noite', badge: 'info' },
        ],
        footer_rule: 'Higiene bucal desde o nascimento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SAÚDE BUCAL',
        items: [
          {
            label: 'Letra A — III e IV',
            detail: 'Aceita mamadeira alterada e omite higiene noturna.',
            correct: 'III e IV são falsas — só I e II corretas.',
          },
          {
            label: 'Letra B — I, II, III e IV',
            detail: 'Todas verdadeiras — inclui condutas erradas.',
            correct: 'III (ampliar bico) e IV (dispensar higiene) são falsas.',
          },
          {
            label: 'Letra C — II, III e IV',
            detail: 'Omite AME exclusivo (I).',
            correct: 'I e II são as únicas verdadeiras.',
          },
          {
            label: 'Letra D — I, II e III',
            detail: 'Inclui ampliação do bico da mamadeira.',
            correct: 'III é falsa — não aumentar orifício para “facilitar”.',
          },
        ],
        footer_rule: 'Mamadeira e higiene noturna = pegadinhas',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-5': {
    family: 'conceito',
    branch: 'crianca_desidratacao',
    guideline: 'SDR / doença da membrana hialina — sinais clínicos (Wong 2023)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SDR no pré-termo',
        meta: slideMeta,
        items: [
          { label: 'SDR', detail: 'Síndrome do desconforto respiratório — doença da membrana hialina.', icon: 'Wind' },
          { label: 'Pré-termo', detail: 'Pulmões imaturos — trocas gasosas prejudicadas no recém-nascido.', icon: 'Baby' },
          { label: 'Enfermagem pediátrica', detail: 'Wong fundamentos de enfermagem pediátrica (2023).', icon: 'BookOpen' },
          { label: 'Sinais clínicos', detail: 'Alargamento narinas, grunhido expiratório, tiragem intercostal.', icon: 'Activity' },
        ],
        footer_rule: 'SDR = desconforto respiratório progressivo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinais clínicos da síndrome do desconforto respiratório (Wong fundamentos pediátrica 2023).',
          'Doença da membrana hialina em recém-nascidos pré-termo.',
          'Eliminar A: diminuição do esforço respiratório — esforço aumenta.',
          'Eliminar C: hiperóxia tecidual — há hipoxemia na SDR.',
          'Eliminar D: dor de garganta — não manifestação neonatal típica.',
          'Eliminar E: vômito e gemência — par incompleto.',
          'Testar B: alargamento das narinas externas e grunhido expiratório audível.',
          'Marcar letra B.',
        ],
        footer_rule: 'B = batimento de asa nasal + grunhido',
      },
      {
        type: 'golden_rule',
        slide_title: 'SDR — sinais clássicos',
        meta: slideMeta,
        content: 'DESCONFORTO RESPIRATÓRÓRIO NEONATAL',
        rows: [
          { label: 'Membrana hialina', value: 'Surfactante insuficiente — pré-termo', badge: 'hot' },
          { label: 'Trocas gasosas', value: 'Pulmões não preparados para oxigenação', badge: 'ok' },
          { label: 'Tórax', value: 'Tiragem intercostal e subcostal', badge: 'info' },
          { label: 'Pele', value: 'Cianose central em casos graves', badge: 'warn' },
        ],
        footer_rule: 'Pré-termo + taquipneia + retrações',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SDR',
        items: [
          {
            label: 'Letra A — diminuição do esforço',
            detail: 'SDR aumenta trabalho respiratório.',
            correct: 'Esforço respiratório aumenta — não diminui na SDR.',
          },
          {
            label: 'Letra C — hiperóxia tecidual',
            detail: 'Confunde com saturação adequada.',
            correct: 'Há hipoxemia e desconforto — não hiperóxia.',
          },
          {
            label: 'Letra D — dor de garganta',
            detail: 'Sintoma incompatível com RN pré-termo.',
            correct: 'Sinais neonatais: retrações, grunhido, cianose.',
          },
          {
            label: 'Letra E — vômito e gemência',
            detail: 'Gemência pode ocorrer, mas vômito não é par clássico Wong.',
            correct: 'Gabarito B: narinas alargadas + grunhido expiratório.',
          },
        ],
        footer_rule: 'Esforço aumenta — nunca diminui na SDR',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563521756-3': {
    family: 'protocolo',
    branch: 'crianca_apgar_reanimacao',
    guideline: 'Classificação de risco ao nascer — baixo peso (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RN alto risco ao nascer',
        meta: slideMeta,
        items: [
          { label: 'Caso clínico', detail: 'RN pré-termo — peso ao nascer classifica alto risco.', icon: 'Baby' },
          { label: 'Sinais vitais', detail: 'Temperatura, frequência respiratória e cardíaca aparentemente estáveis.', icon: 'Activity' },
          { label: 'Classificação', detail: 'Condição imediata ao nascer — baixo peso (<2500 g).', icon: 'Scale' },
          { label: 'Pegadinha', detail: 'Banca oferece IG, T, FR, FC estáveis como distrator.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Baixo peso ao nascer = alto risco',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinal/sintoma que classifica RN como alto risco ao nascer.',
          'Dados do caso: peso ao nascer abaixo de 2500 g — sinais vitais estáveis.',
          'Eliminar A: idade gestacional isolada — peso é critério direto cobrado.',
          'Eliminar B: temperatura normal — não define alto risco.',
          'Eliminar D: frequência respiratória — dentro do esperado.',
          'Eliminar E: frequência cardíaca — normal para recém-nascido.',
          'Testar C: peso ao nascer (baixo peso = alto risco).',
          'Marcar letra C.',
        ],
        footer_rule: 'Peso <2500 g → alto risco',
      },
      {
        type: 'golden_rule',
        slide_title: 'Classificação ao nascer',
        meta: slideMeta,
        content: 'RISCO NEONATAL',
        rows: [
          { label: 'Baixo peso', value: '< 2500 g ao nascer', badge: 'hot', emphasis: 'highlight' },
          { label: 'Pré-termo', value: 'Idade gestacional abaixo do termo', badge: 'ok' },
          { label: 'Muito baixo peso', value: 'Categoria de extremo risco neonatal', badge: 'warn' },
          { label: 'Conduta', value: 'Aquecer, glicemia, vigilância', badge: 'info' },
        ],
        footer_rule: 'Baixo peso ao nascer (<2500 g) = alto risco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ALTO RISCO',
        items: [
          {
            label: 'Letra A — idade gestacional',
            detail: 'IG também define risco, mas questão aponta peso.',
            correct: 'Gabarito C: baixo peso ao nascer classifica alto risco.',
          },
          {
            label: 'Letra B — temperatura adequada',
            detail: 'Temperatura dentro da normalidade não exclui alto risco.',
            correct: 'Baixo peso é o critério cobrado — não temperatura normal.',
          },
          {
            label: 'Letra D — frequência respiratória normal',
            detail: 'Frequência respiratória dentro do esperado para RN.',
            correct: 'Sinais vitais estáveis não cancelam baixo peso — marcar peso.',
          },
          {
            label: 'Letra E — frequência cardíaca normal',
            detail: 'Frequência cardíaca dentro da faixa neonatal.',
            correct: 'Alto risco pelo baixo peso ao nascer — não pelos SV normais.',
          },
        ],
        footer_rule: 'SV normais + baixo peso = ainda alto risco',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const instruction = pack.cleanInstruction
      ? pack.cleanInstruction(raw.question_data.instruction)
      : raw.question_data.instruction;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...raw.question_data, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sc-g02] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g02] total=${ok}`);
}

main();
