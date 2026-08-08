#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g04 (8 slugs coleta_nao_sanguinea).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g04.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'coleta-de-exames-laboratoriais-g04';
const SUBTOPICO = 'Coleta de Exames Laboratoriais';
const BRANCH = 'coleta_nao_sanguinea';
const REVIEWED = '2026-08-05';

const MS_SOURCE = {
  id: 'ms-manual-amostras-biologicas',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Coleta de Amostras Biológicas para Exames Laboratoriais',
  year: 2020,
  url: 'https://www.gov.br/saude/',
  covers: [
    'urina 24 horas',
    'sangue oculto fezes',
    'escarro',
    'urocultura',
    'dismorfismo eritrocitário',
    'transporte refrigerado',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras',
  year: 2024,
  covers: ['jato médio', 'fezes', 'escarro matinal', 'validade'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado' | 'protocolo';
  guideline: string;
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
    pedagogical_branch: BRANCH,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft:coleta-g04',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
    },
    sources: [MS_SOURCE, POTTER_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/causasde/gi, 'causas de')
    .replace(/urgênciamiccional/gi, 'urgência miccional')
    .replace(/infecçãourinária/gi, 'infecção urinária')
    .replace(/paraidentificar/gi, 'para identificar')
    .replace(/conforme orientação/gi, 'conforme orientação')
    .replace(/deve seriniciado/gi, 'deve ser iniciado')
    .replace(/comantibióticos/gi, 'com antibióticos')
    .replace(/éfundamental/gi, 'é fundamental')
    .replace(/deretenção/gi, 'de retenção')
    .replace(/clínicastendo/gi, 'clínicas tendo')
    .replace(/faz se/gi, 'faz-se')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'idcap-enfermagem-coleta-de-exames-laboratoriais-1779563272300-3': {
    family: 'conceito',
    guideline: 'MS — dismorfismo eritrocitário: duas amostras de urina com intervalo de 2 horas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dismorfismo eritrocitário — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Exame renal específico',
            detail: 'Avalia morfologia dos eritrócitos na urina — diferencia origem glomerular vs não glomerular.',
            icon: 'Microscope',
          },
          {
            label: 'Duas amostras',
            detail: 'Protocolo exige 2 coletas de urina — não uma amostra isolada.',
            icon: 'Copy',
          },
          {
            label: 'Intervalo temporal',
            detail: 'Entre as duas coletas: 2 horas — pegadinha numérica clássica.',
            icon: 'Clock',
          },
          {
            label: 'Urina não sanguínea',
            detail: 'Coleta orientada ao paciente — jato médio/higiene conforme protocolo local.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — 3/4/6 h',
            detail: 'Banca troca 2 h por intervalos plausíveis mas errados.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Dismorfismo = 2 amostras · intervalo 2 h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre coleta para dismorfismo eritrocitário.',
          'Exame exige duas amostras de urina — não uma só coleta.',
          'Intervalo entre amostras: 2 horas — eliminar A (3 h), B (4 h) e D (6 h).',
          'Resta C — 2 amostras com intervalo de 2 horas.',
          'Marcar C.',
          'Em similares: dismorfismo eritrocitário = par de amostras + 2 h — decore o número.',
        ],
        footer_rule: 'C = 2 amostras · 2 h de intervalo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — dismorfismo eritrocitário',
        meta: slideMeta,
        content: 'DISMORFISMO ERITROCITÁRIO — DECORE',
        rows: [
          { label: 'Nº amostras', value: '2 coletas de urina', badge: 'hot' },
          { label: 'Intervalo', value: '2 horas entre as coletas', badge: 'hot' },
          { label: 'Objetivo', value: 'Morfologia de hemácias — origem glomerular', badge: 'ok' },
          { label: 'Pegadinha', value: '3 h / 4 h / 6 h são distratores numéricos', badge: 'warn' },
        ],
        footer_rule: '2 + 2 — amostras e horas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DISMORFISMO IDCAP',
        items: [
          {
            label: 'Letra A — intervalo 3 h',
            detail: 'Número próximo de 2 h — parece plausível na prova.',
            correct: 'Protocolo pede 2 horas entre as duas amostras — não 3 h.',
          },
          {
            label: 'Letra B — intervalo 4 h',
            detail: 'Metade de um turno — distractor numérico comum.',
            correct: 'Dismorfismo eritrocitário: intervalo de 2 h entre coletas.',
          },
          {
            label: 'Letra D — intervalo 6 h',
            detail: 'Confunde com jejum ou outras coletas seriadas.',
            correct: 'Duas amostras com 2 h de intervalo — gabarito C.',
          },
          {
            label: 'Confundir com urina 24 h',
            detail: 'Outro exame urinário com regra temporal diferente.',
            correct: 'Dismorfismo = 2 amostras pontuais com 2 h — não pool de 24 h.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Intervalo de 4 h ou 6 h entre amostras de urina.',
            correct: 'Dismorfismo eritrocitário: 2 coletas com 2 h entre elas — gabarito C.',
          },
        ],
        footer_rule: 'Número da banca: 2 amostras · 2 h',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idcap-enfermagem-coleta-de-exames-laboratoriais-1779563272300-4': {
    family: 'certo_errado',
    guideline: 'MS — sangue oculto nas fezes: sem laxantes; incluir sangue/muco/pus; qualquer evacuação',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sangue oculto — fezes',
        meta: slideMeta,
        items: [
          {
            label: 'Pesquisa de sangue oculto',
            detail: 'Detecta hemoglobina oculta — rastreio de sangramento digestivo.',
            icon: 'Search',
          },
          {
            label: 'Amostra representativa',
            detail: 'Pode ser de qualquer evacuação — não exige a primeira do dia.',
            icon: 'Package',
          },
          {
            label: 'Sangue/muco/pus',
            detail: 'Se visíveis, devem compor a amostra enviada.',
            icon: 'Droplets',
          },
          {
            label: 'Parasitas visíveis',
            detail: 'Separar em frasco distinto — não misturar com amostra principal.',
            icon: 'Bug',
          },
          {
            label: 'Sem laxantes',
            detail: 'Laxantes alteram o exame — NÃO são indicados no preparo.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — laxante “ajuda”',
            detail: 'Banca sugere laxante para “facilitar” — conduta incorreta.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Sangue oculto: sem laxante · incluir sangue visível',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa INCORRETA sobre coleta de sangue oculto nas fezes.',
          'A, B e C descrevem orientações corretas — parasitas separados, incluir sangue/muco/pus, qualquer evacuação.',
          'Isolar D — “laxantes são indicados” para realização do exame.',
          'Laxantes e medicamentos irritativos interferem na pesquisa de sangue oculto.',
          'D é a INCORRETA — afirmativa falsa sobre preparo.',
          'Marcar D.',
          'Em similares: INCORRETA em sangue oculto = laxante, dieta errada ou pool de vários dias.',
        ],
        footer_rule: 'INCORRETA = D (laxantes proibidos)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sangue oculto',
        meta: slideMeta,
        content: 'SANGUE OCULTO NAS FEZES — ORIENTAÇÃO',
        rows: [
          { label: 'Evacuação', value: 'Qualquer amostra representativa', badge: 'ok' },
          { label: 'Incluir', value: 'Sangue, muco ou pus se presentes', badge: 'ok' },
          { label: 'Parasitas', value: 'Visíveis → frasco separado', badge: 'warn' },
          { label: 'Proibido', value: 'Laxantes antes/durante coleta', badge: 'hot' },
        ],
        footer_rule: 'Sem laxante — altera resultado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANGUE OCULTO (INCORRETA)',
        items: [
          {
            label: 'Letra A — parasitas em outro frasco',
            detail: 'Parece detalhe dispensável na leitura rápida.',
            correct: 'Conduta correta — parasitas visíveis vão em recipiente separado.',
          },
          {
            label: 'Letra B — incluir sangue/muco/pus',
            detail: 'Pode parecer “exagero” incluir secreções.',
            correct: 'Orientação correta — material representativo deve ir na amostra.',
          },
          {
            label: 'Letra C — qualquer evacuação',
            detail: 'Confunde com exame que exige primeira evacuação.',
            correct: 'Sangue oculto aceita amostra de evacuação habitual — conduta correta.',
          },
          {
            label: 'Letra D — laxantes indicados',
            detail: 'Única afirmativa falsa — laxante “facilita” evacuação.',
            correct: 'Laxantes invalidam pesquisa de sangue oculto — esta é a INCORRETA.',
          },
          {
            label: 'Em outra banca…',
            detail: 'INCORRETA pede laxante ou dieta rica em fibras antes do exame.',
            correct: 'Suspender laxantes — D é a afirmativa falsa nesta IDCAP.',
          },
        ],
        footer_rule: 'INCORRETA = laxante · demais letras são condutas certas',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idcap-enfermagem-exames-laboratoriais-1779563559434-7': {
    family: 'conceito',
    guideline: 'MS — sangue oculto: transporte em até 12 h, refrigerado se necessário',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transporte — sangue oculto',
        meta: slideMeta,
        items: [
          {
            label: 'Cadeia pré-analítica',
            detail: 'Tempo e temperatura entre coleta e laboratório alteram detecção.',
            icon: 'Truck',
          },
          {
            label: 'Prazo máximo',
            detail: 'Até 12 horas para entrega — não “sem limite”.',
            icon: 'Clock',
          },
          {
            label: 'Refrigeração',
            detail: 'Manter em geladeira até envio — preserva amostra.',
            icon: 'Thermometer',
          },
          {
            label: '1 h ambiente',
            detail: 'Prazo curto demais para rotina domiciliar — distrator.',
            icon: 'AlertCircle',
          },
          {
            label: '24 h sem gelo',
            detail: 'Excede validade e ignora refrigeração — pegadinha dupla.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '12 h + geladeira — sangue oculto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: tempo máximo para levar amostra de fezes (sangue oculto) ao laboratório.',
          'Eliminar A — não há limite de tempo (falso).',
          'Eliminar C — 24 h sem refrigeração invalida amostra.',
          'Eliminar D — 6 h pode existir em protocolos, mas gabarito local é 12 h refrigerado.',
          'Eliminar E — 1 h ambiente é prazo irreal para coleta domiciliar.',
          'Marcar B — até 12 h, mantendo em geladeira até o envio.',
          'Em similares: fezes/sangue oculto = prazo curto + refrigeração.',
        ],
        footer_rule: 'B = 12 h refrigerado',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — transporte fezes',
        meta: slideMeta,
        content: 'SANGUE OCULTO — TRANSPORTE',
        rows: [
          { label: 'Prazo', value: 'Até 12 horas para entrega', badge: 'hot' },
          { label: 'Temperatura', value: 'Refrigerar (geladeira) até envio', badge: 'hot' },
          { label: 'Recipiente', value: 'Fechado, identificado, biossegurança', badge: 'ok' },
          { label: 'Evitar', value: 'Ambiente prolongado ou >24 h sem refrigeração', badge: 'warn' },
        ],
        footer_rule: '12 h + geladeira',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRAZO SANGUE OCULTO',
        items: [
          {
            label: 'Letra A — sem limite',
            detail: 'Parece conveniente para paciente domiciliar.',
            correct: 'Amostra de fezes tem validade — 12 h com refrigeração.',
          },
          {
            label: 'Letra C — 24 h sem refrigeração',
            detail: 'Dobra o prazo e remove geladeira — dupla pegadinha.',
            correct: 'Excede tempo seguro e degrada detecção de sangue oculto.',
          },
          {
            label: 'Letra D — 6 h geladeira',
            detail: 'Prazo mais curto — parece mais “rigoroso”.',
            correct: 'Gabarito B: até 12 h refrigerado — não confunda com urina.',
          },
          {
            label: 'Letra E — 1 h ambiente',
            detail: 'Transporte imediato irreal na APS.',
            correct: 'Protocolo permite até 12 h se refrigerado — B.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Prazo de 24 h sem refrigeração ou entrega imediata.',
            correct: 'Sangue oculto: até 12 h mantendo em geladeira — gabarito B.',
          },
        ],
        footer_rule: 'Sem limite (A) e 24 h sem gelo (C) são clássicos',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-coleta-de-exames-laboratoriais-1779562780466-6': {
    family: 'conceito',
    guideline: 'MS — urina 24 h: desprezar 1ª micção matinal; coletar até mesmo horário no dia seguinte',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina 24 horas — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Urina de 24 h',
            detail: 'Quantifica excreção renal (cálculos, proteinúria) — volume total do período.',
            icon: 'FlaskConical',
          },
          {
            label: 'Início do relógio',
            detail: 'Desprezar a primeira urina da manhã — esvaziar bexiga e descartar.',
            icon: 'Sunrise',
          },
          {
            label: 'Coleta contínua',
            detail: 'Todas as micções seguintes vão para o frasco até fechar 24 h.',
            icon: 'Droplets',
          },
          {
            label: 'Fechamento',
            detail: 'No dia seguinte, coletar até o mesmo horário do início.',
            icon: 'Clock',
          },
          {
            label: '≠ jato médio',
            detail: 'Não confundir com EAS/urocultura — aqui é pool de 24 h.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — 1º jato',
            detail: 'Banca troca “primeira urina” por “primeiro jato” de EAS.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '24 h = descartar 1ª manhã · fechar no mesmo horário',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre urina de 24 horas (cálculos renais).',
          'Urina 24 h: descartar 1ª micção matinal e coletar tudo até 24 h depois.',
          'Eliminar B — “duas horas após” no dia seguinte distorce o fechamento.',
          'Eliminar C — “primeiro jato” é técnica de EAS, não de urina 24 h.',
          'Eliminar D — coleta parcial até meia-noite não completa 24 h contínuas.',
          'Marcar A — desprezar 1ª urina da manhã; coletar até mesmo horário no dia seguinte.',
          'Em similares: 24 h = relógio de 24 h · não jato médio isolado.',
        ],
        footer_rule: 'A = início descartado · fim no mesmo horário',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina 24 h',
        meta: slideMeta,
        content: 'URINA 24 HORAS — PROTOCOLO',
        rows: [
          { label: 'Início', value: 'Desprezar 1ª urina da manhã', badge: 'hot' },
          { label: 'Coleta', value: 'Todas as micções no frasco até completar 24 h', badge: 'ok' },
          { label: 'Término', value: 'Mesmo horário do dia seguinte (incluir essa micção)', badge: 'hot' },
          { label: 'Armazenar', value: 'Frasco refrigerado conforme protocolo do lab', badge: 'warn' },
        ],
        footer_rule: 'Descartar início · fechar no relógio de 24 h',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — URINA 24 H CONSULPLAN',
        items: [
          {
            label: 'Letra B — +2 h no dia seguinte',
            detail: 'Parece ajuste fino de horário — altera volume total.',
            correct: 'Fechamento é no mesmo horário de início — não +2 h.',
          },
          {
            label: 'Letra C — primeiro jato',
            detail: 'Importa técnica de jato médio de EAS para pool de 24 h.',
            correct: 'Urina 24 h descarta 1ª micção inteira — não “jato” isolado.',
          },
          {
            label: 'Letra D — até 24h do dia',
            detail: 'Coleta parcial no mesmo dia civil — volume incompleto.',
            correct: 'Protocolo exige 24 h contínuas a partir do descarte matinal.',
          },
          {
            label: 'Confundir com EAS',
            detail: 'Ambos usam urina, mas preparos opostos.',
            correct: 'EAS = jato médio único · 24 h = pool com 1ª manhã descartada.',
          },
        ],
        footer_rule: 'Mesmo horário no dia seguinte — não meia-noite arbitrária',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iset-enfermagem-coleta-de-exames-laboratoriais-1779562735777-2': {
    family: 'conceito',
    guideline: 'MS — ITU: urocultura antes/durante ATB conforme prescrição; não sondar sem indicação',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ITU — manejo inicial',
        meta: slideMeta,
        items: [
          {
            label: 'Quadro clínico',
            detail: 'Idosa DM2 + HAS — dor suprapúbica, urgência, febre, disúria.',
            icon: 'Thermometer',
          },
          {
            label: 'Prioridade diagnóstica',
            detail: 'Urocultura identifica agente e sensibilidade — antes de ATB empírico prolongado.',
            icon: 'FlaskConical',
          },
          {
            label: 'Antibioticoterapia',
            detail: 'Iniciar conforme prescrição médica — técnico executa, não prescreve sozinho.',
            icon: 'Pill',
          },
          {
            label: 'Não repouso passivo',
            detail: 'Aguardar sem tratar agrava ITU em idoso com comorbidades.',
            icon: 'Bed',
          },
          {
            label: 'Sondagem',
            detail: 'Só com retenção/indicação — não rotina para “aliviar dor”.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — só analgesia',
            detail: 'Analgésico sem tratar infecção — distrator parcial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Urocultura + ATB prescrito — não sondagem de rotina',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principal conduta do técnico no manejo inicial de ITU.',
          'ITU febril em idosa: coletar urocultura e tratar conforme médico — eixo A.',
          'Eliminar B — IV/oral imediato sem cultura pode ser inadequado; ATB após coleta.',
          'Eliminar C — repouso absoluto sem diagnóstico/tratamento atrasa conduta.',
          'Eliminar D — analgesia isolada não trata infecção.',
          'Eliminar E — sondagem vesical sem retenção/indicação não é conduta inicial.',
          'Marcar A — urocultura + antibioticoterapia conforme prescrição.',
          'Em similares: ITU = culturar + ATB médico — sondagem só se retenção.',
        ],
        footer_rule: 'A = cultura + ATB prescrito',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ITU + urocultura',
        meta: slideMeta,
        content: 'ITU — CONDUTA DO TÉCNICO',
        rows: [
          { label: 'Coleta', value: 'Urocultura (jato médio/higiene) antes ou no início do ATB', badge: 'hot' },
          { label: 'Tratamento', value: 'Antibioticoterapia conforme prescrição médica', badge: 'hot' },
          { label: 'Evitar', value: 'Sondagem de rotina · só analgesia · repouso passivo', badge: 'warn' },
          { label: 'Idoso', value: 'Comorbidades exigem conduta ativa — não observar', badge: 'ok' },
        ],
        footer_rule: 'Cultura + ATB médico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ITU ISET',
        items: [
          {
            label: 'Letra B — IV + ATB oral imediato',
            detail: 'Parece conduta “agressiva” adequada à febre.',
            correct: 'Prioridade é urocultura e ATB conforme prescrição — não protocolo IV automático.',
          },
          {
            label: 'Letra C — repouso e aguardar',
            detail: 'Parece cuidado conservador em idosa.',
            correct: 'ITU febril exige diagnóstico e tratamento — repouso não substitui ATB.',
          },
          {
            label: 'Letra D — só analgésico',
            detail: 'Alivia sintoma sem tratar causa infecciosa.',
            correct: 'Dor controlada, mas infecção permanece — conduta incompleta.',
          },
          {
            label: 'Letra E — sondagem vesical',
            detail: 'Confunde disúria com retenção urinária.',
            correct: 'Sondagem só com indicação (retenção) — não manejo inicial de ITU.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Conduta inicial = só analgesia ou repouso sem urocultura.',
            correct: 'ITU febril: urocultura + ATB conforme prescrição — gabarito A.',
          },
        ],
        footer_rule: 'Coleta de urina (cultura) é o eixo da questão',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'itame-enfermagem-coleta-de-exames-laboratoriais-1779563200105-7': {
    family: 'conceito',
    guideline: 'MS/Potter — fluidos biológicos de rotina: urina, fezes, saliva, sêmen',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Fluidos laboratoriais',
        meta: slideMeta,
        items: [
          {
            label: 'Exames laboratoriais',
            detail: 'Análises clínicas em amostras biológicas para diagnóstico ou check-up.',
            icon: 'FlaskConical',
          },
          {
            label: 'Urina',
            detail: 'EAS, cultura, 24 h — fluido mais coletado na enfermagem.',
            icon: 'Droplets',
          },
          {
            label: 'Fezes',
            detail: 'Parasitológico, sangue oculto, coprocultura.',
            icon: 'Package',
          },
          {
            label: 'Saliva',
            detail: 'Alguns testes hormonais/infecciosos — fluido não sanguíneo.',
            icon: 'Smile',
          },
          {
            label: 'Sêmen',
            detail: 'Espermograma — fluido reprodutivo de coleta específica.',
            icon: 'Microscope',
          },
          {
            label: 'Pegadinha — quilo/suco gástrico',
            detail: 'Banca inventa “quilo” ou mistura fluidos raros na lista.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Rotina: urina · fezes · saliva · sêmen',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: fluidos biológicos mais comumente coletados em laboratório.',
          'Eliminar A — “quilo” não é fluido biológico (erro ortográfico/conceitual).',
          'Eliminar B — suor e suco gástrico são menos “rotina” que urina/fezes.',
          'Eliminar C — repete “quilo” e suco gástrico.',
          'Marcar D — urina, fezes, saliva e sêmen.',
          'Em similares: lista clássica TE = urina + fezes + saliva + sêmen.',
        ],
        footer_rule: 'D = urina · fezes · saliva · sêmen',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fluidos comuns',
        meta: slideMeta,
        content: 'FLUIDOS — COLETA DE ROTINA',
        rows: [
          { label: 'Urina', value: 'EAS, urocultura, 24 h', badge: 'hot' },
          { label: 'Fezes', value: 'Parasito, sangue oculto, cultura', badge: 'ok' },
          { label: 'Saliva', value: 'Testes selecionados', badge: 'ok' },
          { label: 'Sêmen', value: 'Espermograma', badge: 'ok' },
        ],
        footer_rule: 'Decore D — quatro fluidos clássicos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FLUIDOS ITAME',
        items: [
          {
            label: 'Letra A — quilo',
            detail: 'Palavra inexistente — troca por “suco” ou fluido inventado.',
            correct: 'Fluidos reais: urina, fezes, saliva, sêmen — gabarito D.',
          },
          {
            label: 'Letra B — suor predominante',
            detail: 'Suor entra em exames específicos, não no quartetto clássico.',
            correct: 'Lista pedida: urina, fezes, saliva, sêmen.',
          },
          {
            label: 'Letra C — suco gástrico',
            detail: 'Fluido de coleta especializada — não “mais comum”.',
            correct: 'Rotina laboratorial TE = D.',
          },
          {
            label: 'Confundir com sangue',
            detail: 'Punção venosa para hemograma é outro capítulo — aqui fluidos não sanguíneos.',
            correct: 'Enunciado pede fluidos listados — D completa o gabarito.',
          },
        ],
        footer_rule: '“Quilo” em A/C = eliminação imediata',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779563140631-1': {
    family: 'conceito',
    guideline: 'MS — escarro: manhã antes café; higiene oral; secreção traqueobrônquica (não nasofaringe)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escarro — bacterioscopia/cultura',
        meta: slideMeta,
        items: [
          {
            label: 'Item I — manhã',
            detail: 'Coletar ao acordar, antes do café — maior carga bacteriana.',
            icon: 'Sunrise',
          },
          {
            label: 'Item II — nasofaringe',
            detail: 'INCORRETO — escarro vem de tosse profunda (traqueobrônquico), não rinofaringe.',
            icon: 'XCircle',
          },
          {
            label: 'Item III — indicações',
            detail: 'BK, citologia, fungos e aeróbios — escopo correto da coleta.',
            icon: 'Microscope',
          },
          {
            label: 'Higiene oral',
            detail: 'Enxágue prévio reduz flora oral — mas não substitui tosse profunda.',
            icon: 'Sparkles',
          },
          {
            label: 'Pegadinha — secreção nasal',
            detail: 'Banca aceita “nasofaringe” como sinônimo de escarro — erro clássico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I e III certos · II errado (nasofaringe)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: itens corretos sobre coleta de escarro (I, II, III).',
          'I — manhã antes do café: CORRETO.',
          'II — coletar secreção da nasofaringe: INCORRETO (deve ser escarro traqueobrônquico).',
          'III — BK, citologia, fungos, aeróbios: CORRETO.',
          'Combinação: apenas I e III — letra B.',
          'Marcar B.',
          'Em similares: escarro ≠ catarro nasal — II costuma ser o falso.',
        ],
        footer_rule: 'B = I + III · II cai',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — escarro',
        meta: slideMeta,
        content: 'ESCARRO — ORIENTAÇÃO AO PACIENTE',
        rows: [
          { label: 'Momento', value: 'Manhã, ao acordar, antes do café', badge: 'hot' },
          { label: 'Técnica', value: 'Higiene oral + tosse profunda (escarro traqueobrônquico)', badge: 'hot' },
          { label: 'Evitar', value: 'Saliva ou secreção de nasofaringe', badge: 'warn' },
          { label: 'Exames', value: 'BK, citologia, cultura (fungos/aeróbios)', badge: 'ok' },
        ],
        footer_rule: 'Tosse profunda — não rinofaringe',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCARRO OBJETIVA',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Aceita nasofaringe como fonte de escarro.',
            correct: 'II é falso — escarro é traqueobrônquico, não rinofaringe.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Mantém III correto mas preserva erro do II.',
            correct: 'III certo sozinho não salva II — gabarito B (I e III).',
          },
          {
            label: 'Letra D — todos',
            detail: 'Inclui II falso na combinação.',
            correct: 'II invalida “todos” — só I e III.',
          },
          {
            label: 'Confundir escarro e saliva',
            detail: 'Primeira expectoração pós-higiene pode ser saliva.',
            correct: 'Orientar tosse profunda até escarro purulento/traqueobrônquico.',
          },
        ],
        footer_rule: 'Nasofaringe (II) = item falso clássico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779563140631-2': {
    family: 'conceito',
    guideline: 'MS — urocultura: transporte rápido; higiene com água/sabão; jato médio; refrigerar se atraso',
    exam_vs_current: 'Alternativa A usa prazo/refrigeração literais da banca — pode divergir de protocolo local (24–48 h refrigerado).',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urocultura — orientação',
        meta: slideMeta,
        items: [
          {
            label: 'Transporte rápido',
            detail: 'Urina para cultura deve chegar ao lab em prazo curto — banca: até 1 h.',
            icon: 'Truck',
          },
          {
            label: 'Refrigeração',
            detail: 'Se atraso, refrigerar conforme texto da prova — não deixar ambiente.',
            icon: 'Thermometer',
          },
          {
            label: 'Higiene íntima',
            detail: 'Água e sabão — não antisséptico (altera flora).',
            icon: 'Sparkles',
          },
          {
            label: 'Jato médio',
            detail: 'Primeira urina da manhã é preferencial — banca erra ao “nunca coletar”.',
            icon: 'Droplets',
          },
          {
            label: 'Sonda Foley',
            detail: 'Sistema fechado >48 h invalida amostra de cateter — distrator B.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — antisséptico',
            detail: 'C parece “mais asséptico” — contamina cultura.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Transporte 1 h · sabão · jato médio · sem antisséptico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre urocultura.',
          'A — transporte em até 1 h; se atraso, refrigerar conforme texto: CORRETA na prova.',
          'Eliminar B — Foley/bolsa >48 h invalida amostra de cateter.',
          'Eliminar C — antisséptico na higiene íntima altera urocultura.',
          'Eliminar D — “nunca 1ª urina da manhã” — falso; manhã é preferencial.',
          'Marcar A.',
          'Em similares: urocultura = jato médio + sabão + transporte rápido.',
        ],
        footer_rule: 'A = prazo + refrigeração da banca',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urocultura',
        meta: slideMeta,
        content: 'UROCULTURA — ORIENTAÇÃO',
        rows: [
          { label: 'Coleta', value: 'Higiene com água/sabão + jato médio estéril', badge: 'hot' },
          { label: 'Momento', value: '1ª urina da manhã (preferencial)', badge: 'ok' },
          { label: 'Transporte', value: 'Laboratório em até 1 h (texto banca) — refrigerar se atraso', badge: 'warn' },
          { label: 'Evitar', value: 'Antisséptico genital · cateter >48 h sem critério', badge: 'warn' },
        ],
        footer_rule: 'Sabão sim · antisséptico não',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — UROCULTURA OBJETIVA',
        items: [
          {
            label: 'Letra B — Foley >48 h',
            detail: 'Parece detalhe de cateter irrelevante.',
            correct: 'Amostra de sistema fechado antigo contamina urocultura — alternativa falsa.',
          },
          {
            label: 'Letra C — antisséptico',
            detail: 'Parece maior barreira microbiana.',
            correct: 'Antisséptico reduz crescimento bacteriano — invalida cultura.',
          },
          {
            label: 'Letra D — nunca 1ª manhã',
            detail: 'Inverte orientação clássica de concentração bacteriana.',
            correct: 'Primeira urina da manhã é preferencial — D é falsa.',
          },
          {
            label: 'Prazo vs guideline atual',
            detail: 'Protocolo local pode aceitar 24 h refrigerado.',
            correct: 'Na prova, marcar A — transporte 1 h + refrigeração conforme enunciado.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Transporte em 24 h sem geladeira ou higiene com antisséptico.',
            correct: 'Urocultura: jato médio + sabão + prazo curto — A nesta Objetiva.',
          },
        ],
        footer_rule: 'Antisséptico (C) e anti-manhã (D) são pegadinhas clássicas',
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
    console.log(`[handcraft:coleta-g04] OK ${slug}`);
  }
  console.log(`[handcraft:coleta-g04] total=${ok}`);
}

main();
