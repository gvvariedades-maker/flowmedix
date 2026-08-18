#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g01 (8 slugs P0 coleta_nao_sanguinea).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'coleta-de-exames-laboratoriais-g01';
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
    'urina',
    'fezes',
    'urocultura',
    'EAS',
    'sangue oculto',
    'transporte',
    '24 horas fezes refrigeradas',
    '10 gramas fezes mínimo',
    'abstinência espermograma',
    'jejum 6 horas curva glicêmica',
    'jejum 14 horas sangue',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-coleta-11ed',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Coleta de amostras',
  year: 2024,
  covers: ['jato médio', 'higiene íntima', 'fezes', 'validade'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[]; text_fragment?: string };
  modulo_slug?: string;
};

type Pack = {
  family: 'conceito' | 'vf' | 'certo_errado';
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
      reviewer: 'handcraft:coleta-g01',
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
    .replace(/Sobre oassunto/gi, 'Sobre o assunto')
    .replace(/analisa aaparência/gi, 'analisa a aparência')
    .replace(/facilitara coleta/gi, 'facilitar a coleta')
    .replace(/armazenar as amostras at/gi, 'armazenar as amostras até')
    .replace(/maisdiferentes/gi, 'mais diferentes')
    .replace(/imediamente aolaboratório/gi, 'imediatamente ao laboratório')
    .replace(/manhãe coletar/gi, 'manhã e coletar')
    .replace(/nomínimo/gi, 'no mínimo')
    .replace(/manhã norecipiente/gi, 'manhã no recipiente')
    .replace(/paracoleta/gi, 'para coleta')
    .replace(/corposcetônicos/gi, 'corpos cetônicos')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562730776-1': {
    family: 'conceito',
    guideline: 'MS — urina estéril; sangue venoso com técnica asséptica; jejum e transporte conforme exame',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta e transporte — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Confiabilidade pré-analítica',
            detail: 'Coleta e transporte corretos evitam contaminação e alteram resultados.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Urina',
            detail: 'Recipiente estéril próprio — frasco comum “limpo” não substitui esterilidade.',
            icon: 'FlaskConical',
          },
          {
            label: 'Sangue venoso',
            detail: 'Técnica asséptica protege paciente e amostra na punção.',
            icon: 'Syringe',
          },
          {
            label: 'Jejum seletivo',
            detail: 'Nem todo exame de sangue exige jejum — depende do parâmetro solicitado.',
            icon: 'Clock',
          },
          {
            label: 'Transporte',
            detail: 'Normas de biossegurança e temperatura — não delegar só ao laboratório.',
            icon: 'Truck',
          },
          {
            label: 'Pegadinha — urina “limpa”',
            detail: 'Banca troca esterilidade por recipiente doméstico apenas higienizado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Esterilidade urinária · assépsia venosa · jejum não universal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre coleta e transporte de materiais biológicos.',
          'Urina exige frasco estéril — “qualquer recipiente limpo” invalida A.',
          'Jejum obrigatório para todo exame de sangue é generalização falsa — eliminar C.',
          'Transporte sem normas específicas ignora cadeia pré-analítica — eliminar D.',
          'Sangue venoso com técnica asséptica é conduta correta e segura — B.',
          'Marcar B.',
          'Em similares: assépsia na punção venosa é padrão — urina estéril e jejum seletivo são outros eixos.',
        ],
        footer_rule: 'B = assépsia venosa; A/C/D = generalizações perigosas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pré-analítico',
        meta: slideMeta,
        content: 'COLETA E TRANSPORTE — DECORE',
        rows: [
          { label: 'Urina', value: 'Frasco estéril próprio — identificar e transportar rápido', badge: 'hot' },
          { label: 'Sangue venoso', value: 'Antissepsia + técnica asséptica + identificação', badge: 'ok' },
          { label: 'Jejum', value: 'Conforme exame (glicemia/lipídios ≠ hemograma rotina)', badge: 'warn' },
          { label: 'Transporte', value: 'Recipiente fechado, biossegurança, temperatura do protocolo', badge: 'ok' },
        ],
        footer_rule: 'Esterilidade urinária ≠ “pote limpo de casa”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA GERAL AMEOSC',
        items: [
          {
            label: 'Letra A — urina em qualquer pote',
            detail: 'Parece economia doméstica com recipiente “limpo”.',
            correct: 'Urina laboratorial exige frasco estéril — contaminação altera sedimento e urocultura.',
          },
          {
            label: 'Letra C — jejum universal',
            detail: 'Generaliza preparo de glicemia/lipídios para todo hemograma.',
            correct: 'Jejum depende do parâmetro — nem todo exame de sangue exige 8–12 h.',
          },
          {
            label: 'Letra D — transporte sem norma',
            detail: 'Transfere responsabilidade só ao laboratório após coleta.',
            correct: 'Técnico deve seguir normas de transporte e identificação — cadeia pré-analítica.',
          },
          {
            label: 'Confundir temas na mesma questão',
            detail: 'Urina, sangue, jejum e transporte aparecem juntos para dispersar.',
            correct: 'Isole o eixo de cada alternativa — aqui B (assépsia venosa) é a única correta.',
          },
        ],
        footer_rule: 'Recipiente limpo ≠ estéril para urina',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ameosc-enfermagem-coleta-de-exames-laboratoriais-1779562768558-4': {
    family: 'conceito',
    guideline: 'MS — EAS: jato médio após higiene íntima; frasco estéril; primeira urina da manhã',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EAS / urina tipo I — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Urina tipo I / EAS',
            detail: 'Sumário de Urina — aparência, química e sedimento microscópico.',
            icon: 'FlaskConical',
          },
          {
            label: 'Contexto APS',
            detail: 'Técnico orienta paciente no posto — ITU e função renal entram no escopo.',
            icon: 'Building2',
          },
          {
            label: 'Jato médio',
            detail: 'Descartar primeiro jato e coletar fluxo intermediário no estéril.',
            icon: 'Droplets',
          },
          {
            label: 'Higiene íntima',
            detail: 'Lavagem genital antes da micção reduz flora externa.',
            icon: 'Sparkles',
          },
          {
            label: 'Recipiente',
            detail: 'Frasco estéril próprio — não frasco comum doméstico.',
            icon: 'Package',
          },
          {
            label: 'Pegadinha — jato inicial',
            detail: 'Banca troca jato médio por primeiro jato ou pool diário.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EAS = higiene + descartar início + jato médio estéril',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: orientação correta ao paciente para urina tipo I (EAS).',
          'EAS exige amostra limpa — higiene íntima e jato médio, não primeiro jato nem urina do dia.',
          'Eliminar A — frasco comum e 12 h invalidam esterilidade e validade.',
          'Eliminar B — jato inicial concentra secreção uretral e contamina.',
          'Eliminar C — urina acumulada do dia inteiro é outro tipo de coleta.',
          'Resta D — jato médio após higiene, desprezando início e fim.',
          'Marcar D.',
          'Em similares: urina tipo I = estéril + jato médio — não confunda com pool de 24 h.',
        ],
        footer_rule: 'Roteiro: higiene → descartar início → coletar meio → estéril',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina tipo I',
        meta: slideMeta,
        content: 'EAS / URINA TIPO I — ORIENTAÇÃO',
        rows: [
          { label: 'Momento', value: 'Primeira urina da manhã (preferencial)', badge: 'ok' },
          { label: 'Técnica', value: 'Higiene íntima → descartar jato inicial → coletar jato médio', badge: 'hot' },
          { label: 'Recipiente', value: 'Frasco estéril próprio — identificar imediatamente', badge: 'ok' },
          { label: 'Transporte', value: 'Entregar ao lab o mais rápido possível', badge: 'warn' },
        ],
        footer_rule: 'Decore: higiene · jato médio · estéril',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EAS AMEOSC',
        items: [
          {
            label: 'Letra A — frasco comum 12 h',
            detail: 'Praticidade de guardar em casa até levar ao lab.',
            correct: 'EAS exige frasco estéril e prazo curto — amostra comum degrada o resultado.',
          },
          {
            label: 'Letra B — jato inicial no estéril',
            detail: 'Menciona frasco estéril, mas no fluxo errado da micção.',
            correct: 'Primeiro jato arrasta flora uretral — coletar só o jato médio.',
          },
          {
            label: 'Letra C — urina do dia misturada',
            detail: 'Confunde EAS com urina acumulada ou pool diário.',
            correct: 'Tipo I é amostra isolada da micção, não acumulado de um dia.',
          },
          {
            label: 'Confundir EAS com urocultura',
            detail: 'Ambas usam jato médio, mas frascos e prazos podem diferir.',
            correct: 'Na prova, jato médio + higiene vale para EAS — siga o enunciado.',
          },
        ],
        footer_rule: 'Estéril certo no jato errado ainda reprova',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562780466-0': {
    family: 'conceito',
    guideline: 'MS — urocultura: jato médio em frasco estéril; fezes sem urina/água; jejum conforme exame',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparos laboratoriais — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Fases do exame',
            detail: 'Coleta, quantidade de material biológico, armazenamento e transporte — cada fase importa.',
            icon: 'ListChecks',
          },
          {
            label: 'Profissional de Enfermagem',
            detail: 'Compreender cuidados para facilitar coleta e evitar desconforto ao paciente.',
            icon: 'UserRound',
          },
          {
            label: 'Urocultura',
            detail: 'Urina em frasco estéril — jato médio após higiene; identificar e transportar rápido.',
            icon: 'FlaskConical',
          },
          {
            label: 'Fezes',
            detail: 'Evitar contato com urina e água do vaso — contaminação bacteriana.',
            icon: 'AlertCircle',
          },
          {
            label: 'Jejum variável',
            detail: 'Curva glicêmica ≠ jejum de 14 h genérico — depende do protocolo.',
            icon: 'Clock',
          },
          {
            label: 'Espermograma',
            detail: 'Abstinência sexual tem intervalo definido pelo protocolo do laboratório.',
            icon: 'Microscope',
          },
          {
            label: 'Armazenamento',
            detail: 'Quantidade mínima e temperatura variam conforme o material biológico coletado.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha — jejum único',
            detail: 'Uma alternativa errada de jejum serve de distrator para todas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Cada exame = preparo próprio — não generalize jejum',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre preparo e coleta de diferentes exames.',
          'Urocultura adulto: urina em frasco estéril com técnica limpa — candidata C.',
          'Eliminar E — fezes devem evitar urina e água do vaso sanitário.',
          'Eliminar D — jejum de 14 h genérico não vale para todo exame de sangue.',
          'Eliminar B — curva glicêmica tem protocolo específico de jejum/refeições, não só 6 h isoladas.',
          'Eliminar A — espermograma exige abstinência sexual conforme protocolo, não é o foco do gabarito.',
          'Marcar C — urocultura em frasco estéril.',
          'Em similares: urocultura = estéril + jato médio — fezes exigem evitar urina/água.',
        ],
        footer_rule: 'C = urocultura estéril; demais misturam preparos de outros exames',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparos por exame',
        meta: slideMeta,
        content: 'PREPAROS LABORATORIAIS — DECORE',
        rows: [
          { label: 'Urocultura', value: 'Frasco estéril + higiene + jato médio', badge: 'hot' },
          { label: 'Fezes', value: 'Sem urina/água do vaso — recipiente limpo/fechado', badge: 'ok' },
          { label: 'Sangue / glicemia', value: 'Jejum conforme solicitação (8–12 h comum, não universal)', badge: 'warn' },
          { label: 'Espermograma', value: 'Abstinência sexual conforme protocolo do lab', badge: 'ok' },
        ],
        footer_rule: 'Não troque preparo de fezes pelo de urina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPAROS AVANÇASP',
        items: [
          {
            label: 'Letra A — espermograma abstinência',
            detail: 'Intervalo de abstinência sexual como distrator numérico.',
            correct: 'Abstinência do espermograma segue protocolo local — não é o gabarito desta questão.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Mistura espermograma, curva glicêmica e jejum de 14 h na mesma questão.',
            correct: 'Isole urocultura estéril (C) — demais são preparos de outros exames.',
          },
          {
            label: 'Letra B — curva glicêmica 6 h',
            detail: 'Parece jejum plausível para glicemia.',
            correct: 'Curva glicêmica tem sequência de jejum e ingestão — não só 6 h isoladas.',
          },
          {
            label: 'Letra D — jejum 14 h universal',
            detail: 'Generaliza jejum máximo para todo exame de sangue.',
            correct: 'Jejum depende do parâmetro solicitado — 14 h nem sempre se aplica.',
          },
          {
            label: 'Letra E — fezes sem evitar urina',
            detail: 'Minimiza contaminação pré-analítica.',
            correct: 'Fezes não devem contato com urina ou água do vaso — invalida parasitológico/cultura.',
          },
        ],
        footer_rule: 'Urocultura estéril (C) vs fezes contaminadas (E)',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779562780466-7': {
    family: 'certo_errado',
    guideline: 'MS — urina: jato médio sem jejum; características variam ao longo do dia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Exame de urina — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Solicitação frequente',
            detail: 'Urina aparece em várias especialidades — ITU, renal e metabólico.',
            icon: 'Stethoscope',
          },
          {
            label: 'Coleta limpa',
            detail: 'Assepsia local, descartar primeiro jato, coletar jato médio.',
            icon: 'Droplets',
          },
          {
            label: 'Sem jejum obrigatório',
            detail: 'Urina rotina/EAS não exige jejum de 8 h — pegadinha clássica.',
            icon: 'Utensils',
          },
          {
            label: 'Variação diurna',
            detail: 'Alimentação, medicamentos e exercício alteram cor, densidade e pH.',
            icon: 'Sun',
          },
          {
            label: 'Diagnóstico ampliado',
            detail: 'Detecta renal, ITU e também diabetes, acidose, hepatite.',
            icon: 'Search',
          },
          {
            label: 'Pegadinha — jejum urinário',
            detail: 'Banca importa jejum de sangue para exame de urina.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Urina ≠ sangue — jejum de 8 h não é regra para EAS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa INCORRETA sobre exame de urina.',
          'A, B, D e E descrevem condutas ou fatos corretos — jato médio, variação, diagnóstico.',
          'Isolar C — “jejum de 8 horas necessário” para coleta de urina.',
          'Urina rotina/EAS não exige jejum — preparo é higiene + jato médio.',
          'C é a INCORRETA — afirmativa falsa sobre preparo.',
          'Marcar C.',
          'Em similares: INCORRETA em urina = buscar jejum inventado ou jato inicial.',
        ],
        footer_rule: 'INCORRETA = C (jejum urinário inexistente)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — exame de urina',
        meta: slideMeta,
        content: 'URINA — ORIENTAÇÃO AO PACIENTE',
        rows: [
          { label: 'Jejum', value: 'Não obrigatório para urina rotina/EAS', badge: 'hot' },
          { label: 'Coleta', value: 'Higiene → descartar 1º jato → jato médio estéril', badge: 'ok' },
          { label: 'Momento', value: 'Primeira urina da manhã preferencial — não único', badge: 'warn' },
          { label: 'Utilidade', value: 'Renal, ITU, diabetes, acidose, hepatite (indireto)', badge: 'ok' },
        ],
        footer_rule: 'Jejum de sangue ≠ preparo de urina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — URINA INCORRETA AVANÇASP',
        items: [
          {
            label: 'Letra A — jato médio',
            detail: 'Parece detalhe técnico dispensável.',
            correct: 'É conduta correta — assepsia + descartar 1º jato + jato médio.',
          },
          {
            label: 'Letra B — variação diurna',
            detail: 'Pode parecer “subjetivo” demais para ser verdade.',
            correct: 'Alimentação, fármacos e exercício alteram características urinárias — afirmativa correta.',
          },
          {
            label: 'Letra D — diagnóstico renal',
            detail: 'Escopo “só rins” — na verdade é mais amplo.',
            correct: 'Urina avalia rins e vias urinárias — afirmativa correta, não é a INCORRETA.',
          },
          {
            label: 'Letra E — doenças sistêmicas',
            detail: 'Parece exagero além do trato urinário.',
            correct: 'Glicose, corpos cetônicos e outros achados detectam diabetes, acidose etc. — correta.',
          },
          {
            label: 'Letra C — jejum de 8 h',
            detail: 'Importa jejum de exame de sangue para coleta de urina.',
            correct: 'INCORRETA: urina rotina/EAS não exige jejum — esta é a resposta da questão.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Trocam “jejum de 8 h” por “primeira urina” como obrigatoriedade.',
            correct: 'Urina ≠ sangue — jejum urinário inventado é pegadinha clássica.',
          },
        ],
        footer_rule: 'Só C erra — jejum de 8 h não é preparo de urina',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-6': {
    family: 'conceito',
    guideline: 'MS — fezes: transporte imediato; refrigeração até 24 h se atraso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transporte de fezes — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Pós-coleta',
            detail: 'Entregar amostra fecal ao lab com pedido médico — cadeia pré-analítica.',
            icon: 'Package',
          },
          {
            label: 'Imediato preferencial',
            detail: 'Quanto antes chegar ao lab, menor degradação bacteriana.',
            icon: 'Timer',
          },
          {
            label: 'Refrigeração se atraso',
            detail: 'Temperatura ambiente limitada — refrigerar conforme protocolo.',
            icon: 'Thermometer',
          },
          {
            label: 'Prazo máximo',
            detail: 'Banca cobra 24 h como limite comum após coleta se não entregue.',
            icon: 'Clock',
          },
          {
            label: 'Recipiente',
            detail: 'Fechado, identificado — evitar urina e água do vaso.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha — 48 h',
            detail: 'Opções 36 h e 48 h testam se você conhece o teto de validade.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fezes = entregar rápido · refrigerar se necessário · até 24 h',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: completar prazo máximo de refrigeração da amostra fecal em temperatura ambiente/atraso.',
          'Amostra deve ir imediatamente — se não, refrigerar por tempo limitado.',
          'Eliminar opções com prazo inferior ao protocolo cobrado.',
          'Eliminar opções que excedem validade usual de fezes refrigeradas.',
          '24 horas é o limite clássico citado em manuais de coleta.',
          'Marcar C — 24 horas.',
          'Em similares: fezes refrigeradas ≈ até 24 h — não confunda com urina ou sangue.',
        ],
        footer_rule: 'Lacuna = 24 horas (C)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fezes pós-coleta',
        meta: slideMeta,
        content: 'FEZES — TRANSPORTE E VALIDADE',
        rows: [
          { label: 'Ideal', value: 'Entrega imediata ao laboratório com solicitação', badge: 'hot' },
          { label: 'Se atrasar', value: 'Refrigerar (2–8 °C conforme protocolo local)', badge: 'ok' },
          { label: 'Prazo máximo', value: 'Até 24 horas após coleta com refrigeração (MS)', badge: 'warn' },
          { label: 'Contaminação', value: 'Evitar urina e água do vaso na coleta', badge: 'ok' },
        ],
        footer_rule: 'Decore: imediato · refrigerar · máx. 24 h',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VALIDADE FEZES AVANÇASP',
        items: [
          {
            label: 'Letra A — prazo curto',
            detail: 'Opção com validade inferior ao protocolo da questão.',
            correct: 'Manual e banca usam até 24 h como teto — alternativa A não preenche a lacuna.',
          },
          {
            label: 'Letra B — prazo intermediário',
            detail: 'Número entre o curto e o gabarito para confundir.',
            correct: 'Não é o limite clássico cobrado — gabarito é 24 h.',
          },
          {
            label: 'Letra D — prazo estendido',
            detail: 'Parece margem generosa de conservação.',
            correct: 'Excede validade usual — degradação bacteriana e parasitológica.',
          },
          {
            label: 'Letra E — prazo máximo errado',
            detail: 'Confunde com prazo de outros materiais ou pool urinário.',
            correct: 'Fezes não ficam refrigeradas além do teto típico — máximo 24 h.',
          },
        ],
        footer_rule: '48 h é pegadinha clássica em fezes',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-coleta-de-exames-laboratoriais-1779563248005-4': {
    family: 'conceito',
    guideline: 'MS — sangue oculto: qualquer evacuação; sem laxantes; evitar sangue/muco/pus visível',
    exam_vs_current: 'Gabarito prova = A (I apenas); III é conduta correta na prática — ensinar chave da banca',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sangue oculto nas fezes — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Objetivo',
            detail: 'Detectar sangramento digestivo não visível — rastreio/oncologia.',
            icon: 'Search',
          },
          {
            label: 'Amostra',
            detail: 'Pode ser de qualquer evacuação do período — não só a primeira.',
            icon: 'Package',
          },
          {
            label: 'Sem laxantes',
            detail: 'Laxantes alteram trânsito e podem falsear — contraindicados.',
            icon: 'Ban',
          },
          {
            label: 'Sangue visível',
            detail: 'Muco/pus/sangue macroscópico exige conduta diferente — pegadinha em III.',
            icon: 'AlertCircle',
          },
          {
            label: 'Contaminação',
            detail: 'Evitar urina e água do vaso na coleta da porção fecal.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha — laxante',
            detail: 'Banca inclui laxante como “facilitador” — é erro clássico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Qualquer evacuação · sem laxante · sem sangue visível na amostra',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: V/F sobre orientações ao paciente para sangue oculto nas fezes.',
          'I — amostra de qualquer evacuação: VERDADEIRA.',
          'II — laxantes indicados: FALSA — laxantes contraindicados antes do exame.',
          'III — excluir sangue/muco/pus: banca marca FALSA nesta prova (redação vs gabarito A).',
          'Combinação válida pela chave: só I correta.',
          'Marcar A — I, apenas.',
          'Em similares: sangue oculto = sem laxante; III pode ser pegadinha de redação — siga a chave.',
        ],
        footer_rule: 'Chave A = I apenas; II sempre falsa',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sangue oculto',
        meta: slideMeta,
        content: 'SANGUE OCULTO NAS FEZES — ORIENTAÇÃO',
        rows: [
          { label: 'Evacuação', value: 'Qualquer do período solicitado', badge: 'ok' },
          { label: 'Laxantes', value: 'Não usar — contraindicados', badge: 'hot' },
          { label: 'Coleta', value: 'Porção de fezes sem urina/água do vaso', badge: 'ok' },
          { label: 'Sangue visível', value: 'Comunicar — pode invalidar ou exigir outro exame', badge: 'warn' },
        ],
        footer_rule: 'Laxante antes do exame = erro de prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANGUE OCULTO VF AVANÇASP',
        items: [
          {
            label: 'Letra B — só II',
            detail: 'Laxante parece “ajudar” a evacuar para coleta.',
            correct: 'Laxantes são contraindicados — alteram o resultado do sangue oculto.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'III parece conduta sensata de laboratório.',
            correct: 'Pela chave desta prova, só I é validada — não marque III junto.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Combina laxante com exclusão de sangue visível.',
            correct: 'II é falsidade clara — elimina D inteira.',
          },
          {
            label: 'Letra E — I, II e III',
            detail: 'Aceita laxante como correto.',
            correct: 'II invalida qualquer combinação que a inclua.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Combina I com III quando só I é chave nesta prova.',
            correct: 'Laxante sempre falso — não marque II em nenhuma alternativa.',
          },
        ],
        footer_rule: 'II falsa mata B, D e E de uma vez',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-exames-laboratoriais-1779563549311-5': {
    family: 'conceito',
    guideline: 'MS/Potter — tiras reagentes: proteínas, glicose e corpos cetônicos = elementos anormais (química urinária)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urina — tira reagente',
        meta: slideMeta,
        items: [
          {
            label: 'Monitoramento',
            detail: 'Ao longo do exame, avaliar parâmetros físicos, químicos e microscópicos.',
            icon: 'Activity',
          },
          {
            label: 'Tira reagente',
            detail: 'Fitas dipstick detectam substâncias químicas na urina rapidamente.',
            icon: 'TestTube',
          },
          {
            label: 'Proteínas',
            detail: 'Proteinúria — achado químico, não olfativo.',
            icon: 'Droplets',
          },
          {
            label: 'Glicose',
            detail: 'Glicosúria sugere hiperglicemia — lida pela faixa química.',
            icon: 'Candy',
          },
          {
            label: 'Corpos cetônicos',
            detail: 'Cetonúria — metabolismo — mesma faixa de elementos anormais.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — odor/volume',
            detail: 'Banca troca parâmetro físico (odor, volume, pH) pelo químico da tira.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tira reagente = química urinária (elementos anormais)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que se avalia com tiras reagentes para proteínas, glicose e corpos cetônicos.',
          'Tiras reagentes medem substâncias químicas — classe “elementos anormais” do EAS.',
          'Eliminar A (odor) e B (volume) — parâmetros físicos, não dipstick químico.',
          'Eliminar C (densidade) e D (pH) — podem ter faixa na tira, mas não são o trio do enunciado.',
          'Proteínas, glicose e cetona = elementos anormais na nomenclatura do sumário de urina.',
          'Marcar E — Elementos anormais.',
          'Em similares: dipstick de proteína/glicose/cetona = química = elementos anormais.',
        ],
        footer_rule: 'E = elementos anormais (química urinária)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — EAS por tira',
        meta: slideMeta,
        content: 'URINA — FAIXAS DO EAS',
        rows: [
          { label: 'Físico', value: 'Cor, aspecto, odor, densidade', badge: 'ok' },
          { label: 'Químico / elementos anormais', value: 'Proteínas, glicose, corpos cetônicos, bilirrubina…', badge: 'hot' },
          { label: 'Sedimentoscopia', value: 'Elementos microscópicos e cilindros', badge: 'ok' },
          { label: 'Tira reagente', value: 'Triagem química rápida — dipstick', badge: 'warn' },
        ],
        footer_rule: 'Proteína + glicose + cetona = elementos anormais',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TIRA REAGENTE AVANÇASP',
        items: [
          {
            label: 'Letra A — odor',
            detail: 'Característica organoléptica da amostra.',
            correct: 'Odor é parâmetro físico — não é o alvo das tiras para proteína/glicose/cetona.',
          },
          {
            label: 'Letra B — volume',
            detail: 'Quantidade urinária coletada.',
            correct: 'Volume é dado de coleta, não leitura química da tira.',
          },
          {
            label: 'Letra C — densidade',
            detail: 'Pode ser lida na tira em alguns painéis.',
            correct: 'Densidade não agrupa o trio proteína/glicose/cetona pedido no enunciado.',
          },
          {
            label: 'Letra D — pH',
            detail: 'Parâmetro químico, mas não nomeia o grupo correto.',
            correct: 'pH isolado não é a rubrica “elementos anormais” para proteínas e glicose.',
          },
          {
            label: 'Em similares…',
            detail: 'Banca pergunta odor ou densidade em vez de dipstick químico.',
            correct: 'Proteína + glicose + cetona = sempre elementos anormais no EAS.',
          },
        ],
        footer_rule: 'Nomenclatura EAS: elementos anormais = faixa química',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'cogeps-unioeste-enfermagem-exames-laboratoriais-1779563650975-2': {
    family: 'conceito',
    guideline: 'MS — urina qualitativa: higiene + descartar 1º jato + jato médio; urocultura ≠ 1º jato',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta não sanguínea — terreno',
        meta: slideMeta,
        items: [
          {
            label: 'Urina qualitativa',
            detail: 'EAS/rotina — higiene do períneo, descartar início, jato médio.',
            icon: 'FlaskConical',
          },
          {
            label: 'Fezes',
            detail: 'Evacuar com auxílio do coletor — mínimo ~10 g no recipiente fechado.',
            icon: 'Package',
          },
          {
            label: 'Sangue venoso',
            detail: 'Antebraço/fossa cubital — garrote, punção, algodão seco (não álcool puro pós).',
            icon: 'Syringe',
          },
          {
            label: 'Urocultura',
            detail: 'Jato médio estéril — primeiro jato contamina.',
            icon: 'Microscope',
          },
          {
            label: 'Pegadinha — 1º jato',
            detail: 'Alternativas D e E trocam jato médio por primeiro jato na urina.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Higiene do períneo',
            detail: 'Passo comum a urina qualitativa e urocultura — não substitui jato médio.',
            icon: 'Sparkles',
          },
        ],
        footer_rule: 'Urina qualitativa = higiene + jato médio — nunca 1º jato',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre coleta de material para exames.',
          'Urina qualitativa: higiene simples, desprezar 1º jato, coletar jato médio — A.',
          'Eliminar D e E — coletar primeiro jato invalida qualitativo e urocultura.',
          'Eliminar B — fezes no vaso sem evitar contaminação/quantidade pode estar incompleta vs protocolo.',
          'Eliminar C — sangue: algodão seco pós-punção ok, mas bisel/agulha “aspirar” não é técnica padrão de vácuo.',
          'Marcar A — urina qualitativa com jato médio após higiene.',
          'Em similares: 1º jato vs jato médio separa EAS/qualitativo de erro clássico de prova.',
        ],
        footer_rule: 'A = jato médio; D/E = pegadinha do 1º jato',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — urina e fezes COGEPS',
        meta: slideMeta,
        content: 'COLETA NÃO SANGUÍNEA — DECORE',
        rows: [
          { label: 'Urina qualitativa', value: 'Higiene períneo → descartar 1º jato → jato médio', badge: 'hot' },
          { label: 'Urocultura', value: 'Mesma técnica limpa + frasco estéril — não 1º jato', badge: 'ok' },
          { label: 'Fezes', value: 'Coletor auxiliar, mínimo 10 g no recipiente fechado (MS)', badge: 'ok' },
          { label: '1º jato', value: 'Sempre descartar na urina de rotina', badge: 'warn' },
        ],
        footer_rule: 'Primeiro jato = contaminação uretral',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COGEPS URINA/FEZES',
        items: [
          {
            label: 'Letra B — fezes no vaso',
            detail: 'Menciona 10 g mínimo e coletor — parece completa.',
            correct: 'Orientação pode faltar evitar urina/água — A (urina) é a CORRETA pedida.',
          },
          {
            label: 'Letra C — punção venosa',
            detail: 'Descreve garrote e local preferencial plausível.',
            correct: 'Técnica de aspiração/bisel não é padrão vácuo — não é a alternativa CORRETA aqui.',
          },
          {
            label: 'Letra D — 1º jato qualitativo',
            detail: 'Copia higiene correta mas erra o jato coletado.',
            correct: 'Primeiro jato contamina — coletar jato médio após desprezar início.',
          },
          {
            label: 'Letra E — 1º jato urocultura',
            detail: 'Mesma pegadinha aplicada à cultura.',
            correct: 'Urocultura exige jato médio estéril — 1º jato invalida a amostra.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Alternativas D/E invertem só o jato mantendo higiene correta.',
            correct: 'Jato médio após desprezar início — padrão urina qualitativa e urocultura.',
          },
        ],
        footer_rule: 'Higiene certa + 1º jato errado = alternativa falsa',
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
    console.log(`[handcraft:coleta-g01] OK ${slug}`);
  }
  console.log(`[handcraft:coleta-g01] total=${ok}`);
}

main();
