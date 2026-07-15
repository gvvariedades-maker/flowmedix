#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g06 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g06.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g06 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g06 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g06';
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
    'alimentação complementar',
    'leite de vaca',
    'estressores pediátricos',
    'diarreia APS',
    'saúde bucal coletiva',
    'atribuições técnico enfermagem',
    'violência infantil',
    'pele recém-nascido',
  ],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'crianca_aleitamento_nutricao'
  | 'crianca_aps_puericultura'
  | 'crianca_desidratacao'
  | 'crianca_saude_bucal'
  | 'crianca_violencia_protecao';

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
    .replace(/entrecrianças/gi, 'entre crianças')
    .replace(/Técnico de\s+Enfermagem/gi, 'Técnico de Enfermagem')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'idib-enfermagem-saude-da-crianca-1778934936220-7': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Alimentação complementar — evitar leite de vaca integral no 1º ano (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alimentação no 1º ano',
        meta: slideMeta,
        items: [
          { label: 'AME', detail: 'Exclusivo até 6 meses — padrão ouro de nutrição.', icon: 'Baby' },
          { label: 'Complementar', detail: 'A partir dos 6 meses — cereais, tubérculos, proteínas variadas.', icon: 'Apple' },
          { label: 'Leite de vaca', detail: 'Integral não deve ser principal antes de 1 ano — risco renal e anemia.', icon: 'XCircle' },
          { label: 'Fórmula', detail: 'Indicada se ausência de leite materno — com orientação profissional.', icon: 'Droplets' },
        ],
        footer_rule: 'Evitar leite de vaca integral como principal <1 ano',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando INCORRETA: prática alimentar a evitar no 1º ano de vida.',
          'Eliminar A: cereais/tubérculos aos 6 meses — conduta correta MS/OMS.',
          'Eliminar C: proteínas vegetais diversificadas — prática adequada.',
          'Eliminar D: fórmula na ausência de LM — conduta aceita.',
          'Testar B: leite de vaca integral como principal fonte — prática a evitar.',
          'Marcar letra B.',
          'Fixação: LM/fórmula até 1 ano — não leite de vaca integral principal.',
        ],
        footer_rule: 'B = leite de vaca integral principal — evitar',
      },
      {
        type: 'golden_rule',
        slide_title: 'O que evitar no 1º ano',
        meta: slideMeta,
        content: 'NUTRIÇÃO INFANTIL',
        rows: [
          { label: 'Evitar', value: 'Leite de vaca integral como principal <1 ano', badge: 'hot', emphasis: 'highlight' },
          { label: '6 meses', value: 'Introduzir complementar — cereais, tubérculos', badge: 'ok' },
          { label: 'Diversificar', value: 'Feijão, lentilha e proteínas vegetais', badge: 'info' },
          { label: 'Substituto', value: 'Fórmula infantil se sem LM', badge: 'warn' },
        ],
        footer_rule: 'Leite de vaca integral só após 1 ano (com orientação)',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ALIMENTAÇÃO 1º ANO',
        items: [
          {
            label: 'Letra A — cereais aos 6 meses',
            detail: 'Introdução alimentar no tempo certo.',
            correct: 'Cereais e tubérculos aos 6 meses respeitam maturação digestiva — prática correta.',
          },
          {
            label: 'Letra C — proteínas vegetais',
            detail: 'Dieta diversificada e equilibrada.',
            correct: 'Feijão e lentilha são recomendados na complementação — não é prática a evitar.',
          },
          {
            label: 'Letra D — fórmula sem LM',
            detail: 'Garante nutrição quando não há amamentação.',
            correct: 'Fórmula adequada substitui LM quando necessário — conduta correta.',
          },
        ],
        footer_rule: 'INCORRETA = leite de vaca integral principal',
      },
    ],
  },

  'idib-enfermagem-saude-da-crianca-1778934936220-8': {
    family: 'conceito',
    branch: 'crianca_aps_puericultura',
    guideline: 'Estratificação de risco pediátrica — estressores de longa duração (CAB MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estressores — duração',
        meta: slideMeta,
        items: [
          { label: 'Estratificação', detail: 'Avaliar fatores de risco e proteção na puericultura.', icon: 'BarChart' },
          { label: 'Curta duração', detail: 'Estressor agudo pode impactar, mas duração importa.', icon: 'Clock' },
          { label: 'Longa duração', detail: 'Estressores tóxicos persistentes alteram neurodesenvolvimento.', icon: 'AlertTriangle' },
          { label: 'Pegadinha', detail: '“Curta duração é inofensiva” ou “protetores sempre neutralizam”.', icon: 'XCircle' },
        ],
        footer_rule: 'Persistência do estressor = maior dano',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: importância da duração dos fatores estressores na estratificação de risco.',
          'Eliminar A: curta duração sempre inofensiva — minimiza impacto agudo.',
          'Eliminar B: duração irrelevante — todos iguais — falso.',
          'Eliminar C: longa duração sempre neutralizada por fatores protetores — falso.',
          'Testar D: persistência de estressores tóxicos altera desenvolvimento neuropsicológico e físico.',
          'Marcar letra D.',
          'Fixação: cronicidade do estressor pesa na estratificação.',
        ],
        footer_rule: 'D = estressores persistentes → alterações significativas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Estressores na infância',
        meta: slideMeta,
        content: 'ESTRATIFICAÇÃO DE RISCO',
        rows: [
          { label: 'Longa duração', value: 'Pode alterar neurodesenvolvimento e crescimento', badge: 'hot', emphasis: 'highlight' },
          { label: 'Protetores', value: 'Mitigam, mas não neutralizam sempre', badge: 'ok' },
          { label: 'Avaliação', value: 'Duração + intensidade + suporte familiar', badge: 'info' },
          { label: 'APS', value: 'Identificar precocemente na puericultura', badge: 'warn' },
        ],
        footer_rule: 'Tempo importa — não só presença do fator',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTRESSORES',
        items: [
          {
            label: 'Letra A — curta duração inofensiva',
            detail: 'Generaliza que estressor breve não afeta.',
            correct: 'Mesmo estressores agudos podem impactar — duração não é irrelevante.',
          },
          {
            label: 'Letra B — duração irrelevante',
            detail: 'Nega graduação de risco por temporalidade.',
            correct: 'Persistência modula impacto — duração é central na estratificação.',
          },
          {
            label: 'Letra C — protetores sempre neutralizam',
            detail: 'Superestima fatores de proteção.',
            correct: 'Estressores crônicos podem superar proteção — gabarito D.',
          },
        ],
        footer_rule: 'Cronicidade ≠ inofensivo',
      },
    ],
  },

  'igeduc-enfermagem-atencao-basica-saude-da-familia-1778968028412-2': {
    family: 'protocolo',
    branch: 'crianca_desidratacao',
    guideline: 'Diarreia na APS — atribuições do Técnico de Enfermagem (CAB/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diarreia — técnico na APS',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Criança com diarreia aguda e sinais clínicos sugestivos de desidratação na APS.', icon: 'Droplets' },
          { label: 'Papel do TE', detail: 'Observar, acolher, orientar conforme protocolo — não prescrever.', icon: 'Users' },
          { label: 'Comunicação', detail: 'Comunicar equipe para avaliação médica/enfermeira.', icon: 'Phone' },
          { label: 'Pegadinha', detail: 'Prescrever SRO, dar antidiarreico ou encerrar sem orientação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE observa + orienta + comunica equipe',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta CORRETA do Técnico de Enfermagem na APS — diarreia com desidratação.',
          'Eliminar B: prescrever SRO e esquema — atribuição de prescritor.',
          'Eliminar C: encerrar sem orientações — negligência no acolhimento.',
          'Eliminar D: antidiarreico sem prescrição — conduta inadequada e insegura.',
          'Testar A: observar sinais, orientar por protocolo e comunicar equipe.',
          'Marcar letra A.',
          'Fixação: técnico não prescreve — acolhe e escala.',
        ],
        footer_rule: 'A = observar + orientar + comunicar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Atribuições do TE — diarreia',
        meta: slideMeta,
        content: 'ATENÇÃO BÁSICA',
        rows: [
          { label: 'Fazer', value: 'Observar sinais + orientar protocolo + comunicar equipe', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não fazer', value: 'Prescrever SRO ou antidiarreico', badge: 'warn' },
          { label: 'Não fazer', value: 'Encerrar sem orientação', badge: 'warn' },
          { label: 'Plano A/B/C', value: 'Definido por profissional habilitado', badge: 'info' },
        ],
        footer_rule: 'Escalar desidratação à equipe',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ATRIBUIÇÕES TE',
        items: [
          {
            label: 'Letra B — prescrever SRO',
            detail: 'Prescrição e definição de esquema excedem atribuição do técnico.',
            correct: 'TE orienta conforme protocolo — prescrição é do enfermeiro/médico.',
          },
          {
            label: 'Letra C — encerrar sem orientar',
            detail: 'Abandona criança desidratada sem conduta.',
            correct: 'Acolhimento exige orientação e comunicação à equipe — não alta silenciosa.',
          },
          {
            label: 'Letra D — antidiarreico sem prescrição',
            detail: 'Medicamento sem prescrição e antidiarreico não é rotina em crianças.',
            correct: 'Antidiarreico sem prescrição é conduta incorreta — gabarito A.',
          },
        ],
        footer_rule: 'Técnico acolhe — não prescreve',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-atencao-basica-saude-da-familia-1780001297464-8': {
    family: 'protocolo',
    branch: 'crianca_desidratacao',
    guideline: 'Diarreia na APS — atribuições do Técnico de Enfermagem (CAB/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diarreia — técnico na APS',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Criança com diarreia aguda e sinais clínicos sugestivos de desidratação na APS.', icon: 'Droplets' },
          { label: 'Papel do TE', detail: 'Observar, acolher, orientar conforme protocolo — não prescrever.', icon: 'Users' },
          { label: 'Comunicação', detail: 'Comunicar equipe para avaliação médica/enfermeira.', icon: 'Phone' },
          { label: 'Pegadinha', detail: 'Prescrever SRO, dar antidiarreico ou encerrar sem orientação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE observa + orienta + comunica equipe',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta CORRETA do Técnico de Enfermagem na APS — diarreia com desidratação.',
          'Eliminar B: prescrever SRO e esquema — atribuição de prescritor.',
          'Eliminar C: encerrar sem orientações — negligência no acolhimento.',
          'Eliminar D: antidiarreico sem prescrição — conduta inadequada e insegura.',
          'Testar A: observar sinais, orientar por protocolo e comunicar equipe.',
          'Marcar letra A.',
          'Fixação: técnico não prescreve — acolhe e escala.',
        ],
        footer_rule: 'A = observar + orientar + comunicar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Atribuições do TE — diarreia',
        meta: slideMeta,
        content: 'ATENÇÃO BÁSICA',
        rows: [
          { label: 'Fazer', value: 'Observar sinais + orientar protocolo + comunicar equipe', badge: 'hot', emphasis: 'highlight' },
          { label: 'Não fazer', value: 'Prescrever SRO ou antidiarreico', badge: 'warn' },
          { label: 'Não fazer', value: 'Encerrar sem orientação', badge: 'warn' },
          { label: 'Plano A/B/C', value: 'Definido por profissional habilitado', badge: 'info' },
        ],
        footer_rule: 'Escalar desidratação à equipe',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ATRIBUIÇÕES TE',
        items: [
          {
            label: 'Letra B — prescrever SRO',
            detail: 'Prescrição e definição de esquema excedem atribuição do técnico.',
            correct: 'TE orienta conforme protocolo — prescrição é do enfermeiro/médico.',
          },
          {
            label: 'Letra C — encerrar sem orientar',
            detail: 'Abandona criança desidratada sem conduta.',
            correct: 'Acolhimento exige orientação e comunicação à equipe — não alta silenciosa.',
          },
          {
            label: 'Letra D — antidiarreico sem prescrição',
            detail: 'Medicamento sem prescrição e antidiarreico não é rotina em crianças.',
            correct: 'Antidiarreico sem prescrição é conduta incorreta — gabarito A.',
          },
        ],
        footer_rule: 'Técnico acolhe — não prescreve',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'inaz-do-para-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-1': {
    family: 'conceito',
    branch: 'crianca_saude_bucal',
    guideline: 'Cárie dental coletiva — escovação supervisionada e selantes (SB Brasil/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cárie — saúde coletiva',
        meta: slideMeta,
        items: [
          { label: 'Problema', detail: 'Alta prevalência de cárie em comunidade de baixa renda.', icon: 'Users' },
          { label: 'Coletivo', detail: 'Intervenção escolar atinge população de risco em escala.', icon: 'School' },
          { label: 'Escovação supervisionada', detail: 'Hábito diário com orientação — reduz biofilme.', icon: 'Sparkles' },
          { label: 'Selantes', detail: 'Proteção de fissuras — prevenção de cárie em dentes permanentes/molares.', icon: 'Shield' },
        ],
        footer_rule: 'Prevenção coletiva: escola + supervisão + selante',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: estratégia coletiva mais eficaz para reduzir cárie.',
          'Eliminar A: só distribuir escova/pasta — não garante uso correto.',
          'Eliminar C: consultas odontológicas periódicas — alto custo, baixa cobertura.',
          'Eliminar D: treinar pais — importante, mas menos abrangente que programa escolar.',
          'Eliminar E: fluoretação da água local — intervenção estrutural complexa.',
          'Testar B: escovação supervisionada escolar + selantes.',
          'Marcar letra B.',
          'Fixação: ação coletiva na escola = maior impacto populacional.',
        ],
        footer_rule: 'B = escovação supervisionada + selantes',
      },
      {
        type: 'golden_rule',
        slide_title: 'Prevenção coletiva de cárie',
        meta: slideMeta,
        content: 'SAÚDE BUCAL COLETIVA',
        rows: [
          { label: 'Mais eficaz', value: 'Programa escolar: escovação supervisionada + selantes', badge: 'hot', emphasis: 'highlight' },
          { label: 'Escova/pasta', value: 'Distribuição isolada — insuficiente', badge: 'info' },
          { label: 'Consultas', value: 'Curativo — não prevenção em massa', badge: 'warn' },
          { label: 'Flúor', value: 'Pasta fluoretada + selante — combo preventivo', badge: 'ok' },
        ],
        footer_rule: 'Escola = território da prevenção coletiva',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CÁRIE COLETIVA',
        items: [
          {
            label: 'Letra A — distribuir escovas',
            detail: 'Doação sem supervisão não muda hábito.',
            correct: 'Distribuição isolada é menos eficaz que programa escolar supervisionado.',
          },
          {
            label: 'Letra C — consultas periódicas',
            detail: 'Abordagem individual — difícil escalar em comunidade pobre.',
            correct: 'Prevenção coletiva prioriza ações escolares em massa — gabarito B.',
          },
          {
            label: 'Letra D — treinar pais',
            detail: 'Relevante, mas alcance menor que intervenção escolar estruturada.',
            correct: 'Escovação supervisionada na escola + selantes tem maior impacto populacional.',
          },
          {
            label: 'Letra E — fluoretação da água',
            detail: 'Medida estrutural válida, mas não a resposta “programa escolar” da prova.',
            correct: 'Estratégia escolar com supervisão e selantes é a mais eficaz no enunciado.',
          },
        ],
        footer_rule: 'Coletivo = escola estruturada',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968094018-1': {
    family: 'conceito',
    branch: 'crianca_aps_puericultura',
    guideline: 'Atribuições do técnico de enfermagem na APS — CAB 33 (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnico — puericultura APS',
        meta: slideMeta,
        items: [
          { label: 'Contexto', detail: 'Consulta de puericultura — criança 10 meses.', icon: 'Baby' },
          { label: 'Antropometria', detail: 'Aferir peso e estatura — atribuição do técnico.', icon: 'Ruler' },
          { label: 'Vacinação', detail: 'Aplicar vacinas conforme calendário — competência do técnico.', icon: 'Syringe' },
          { label: 'Pegadinha', detail: 'Emitir parecer de atraso motor ou recusar PA em criança.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'TE: peso, estatura, vacinas — encaminha avaliação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: atribuição do técnico em enfermagem na APS (CAB 33).',
          'Eliminar A: avaliar desenvolvimento e emitir parecer — competência ampliada.',
          'Eliminar B: PA só em adultos — técnico pode aferir em crianças.',
          'Eliminar C: só tarefas administrativas — técnico participa do cuidado.',
          'Testar D: peso, estatura, vacinas e encaminhar dados ao responsável.',
          'Marcar letra D.',
          'Fixação: técnico coleta dados e vacina — não diagnostica atraso.',
        ],
        footer_rule: 'D = antropometria + vacinas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Técnico na puericultura',
        meta: slideMeta,
        content: 'CAB 33 — ATENÇÃO BÁSICA',
        rows: [
          { label: 'Peso/estatura', value: 'Aferir e registrar', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vacinas', value: 'Aplicar conforme calendário', badge: 'ok' },
          { label: 'Encaminhar', value: 'Dados ao profissional da puericultura', badge: 'info' },
          { label: 'Não é', value: 'Parecer de atraso do desenvolvimento', badge: 'warn' },
        ],
        footer_rule: 'Coleta + vacina — avaliação clínica do enfermeiro/médico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ATRIBUIÇÕES TE',
        items: [
          {
            label: 'Letra A — parecer de atraso motor',
            detail: 'Diagnóstico/avaliação de desenvolvimento excede atribuição.',
            correct: 'Técnico afere dados — parecer de atraso é do profissional habilitado.',
          },
          {
            label: 'Letra B — PA só em adultos',
            detail: 'Restringe indevidamente aferição pediátrica.',
            correct: 'Técnico pode aferir PA em crianças quando indicado — alternativa falsa.',
          },
          {
            label: 'Letra C — só administrativo',
            detail: 'Nega participação no cuidado direto.',
            correct: 'Técnico interage na consulta — peso, estatura e vacinas — gabarito D.',
          },
        ],
        footer_rule: 'Técnico executa — não conclui desenvolvimento',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-4': {
    family: 'conceito',
    branch: 'crianca_violencia_protecao',
    guideline: 'Fatores de risco para violência infantil — CAB/MS 2012',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Risco de violência infantil',
        meta: slideMeta,
        items: [
          { label: 'ACS', detail: 'Identifica risco na comunidade e comunica à ESF.', icon: 'Home' },
          { label: 'Fatores de risco', detail: 'Violência aprendida, instabilidade, álcool/drogas, punição física.', icon: 'AlertTriangle' },
          { label: 'Fator protetor', detail: 'Pais sem história de maus-tratos na infância — reduz risco.', icon: 'Shield' },
          { label: 'Comando', detail: 'NÃO é situação de risco — marcar fator protetor.', icon: 'Search' },
        ],
        footer_rule: 'Pais não maltratados na infância = proteção, não risco',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: NÃO é situação de risco para violência infantil (MS 2012).',
          'B — violência como resolução de conflitos: fator de risco → eliminar.',
          'C — instabilidade familiar e álcool/drogas: fator de risco → eliminar.',
          'D — punição física normalizada: fator de risco → eliminar.',
          'A — pais não maltratados na infância: fator PROTETOR — não é risco.',
          'Marcar letra A.',
          'Fixação: história parental sem violência protege a criança.',
        ],
        footer_rule: 'A = fator protetor (NÃO é risco)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Risco × proteção',
        meta: slideMeta,
        content: 'VIOLÊNCIA INFANTIL',
        rows: [
          { label: 'Risco', value: 'Violência aprendida, drogas, instabilidade, palmadas', badge: 'warn' },
          { label: 'Proteção', value: 'Pais sem maus-tratos na infância', badge: 'hot', emphasis: 'highlight' },
          { label: 'ACS', value: 'Comunicar ESF ante evidências', badge: 'ok' },
          { label: 'Conduta', value: 'Notificar e acolher — rede de proteção', badge: 'info' },
        ],
        footer_rule: 'Identificar risco cedo na visita domiciliar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RISCO DE VIOLÊNCIA',
        items: [
          {
            label: 'Letra B — violência como resolução',
            detail: 'Modelo agressivo de resolução de conflitos.',
            correct: 'É fator de risco para violência contra a criança — não é o NÃO-risco.',
          },
          {
            label: 'Letra C — instabilidade e álcool/drogas',
            detail: 'Ambiente familiar vulnerável.',
            correct: 'Uso abusivo de substâncias e instabilidade são fatores de risco — eliminar.',
          },
          {
            label: 'Letra D — punição física normalizada',
            detail: 'Palmada como disciplina rotineira.',
            correct: 'Punição física é fator de risco — gabarito A (fator protetor).',
          },
        ],
        footer_rule: 'B, C, D são riscos; A é proteção',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-6': {
    family: 'conceito',
    branch: 'crianca_desidratacao',
    guideline: 'Pele do recém-nascido — características e cuidados (Caderneta MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pele do RN — visita domiciliar',
        meta: slideMeta,
        items: [
          { label: 'Visitas domiciliares', detail: 'Famílias de gestantes e crianças na primeira semana pós-parto — ACS apoia no cuidado ao bebê.', icon: 'Home' },
          { label: 'Pele avermelhada', detail: 'Recém-nascido com vernix caseosa — camada de gordura protetora contra infecções.', icon: 'Baby' },
          { label: 'Descamação', detail: 'Pele delicada e fina — pode descamar nos primeiros dias de vida.', icon: 'Droplets' },
          { label: 'Casquinhas', detail: 'Couro cabeludo — comuns e geralmente não incomodam o bebê.', icon: 'Circle' },
        ],
        footer_rule: 'ACS orienta cuidados com pele do recém-nascido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre pele do recém-nascido — visitas domiciliares e cuidado do agente comunitário de saúde.',
          'Contexto: pele avermelhada, vernix caseosa, proteção contra infecções e apoio às famílias no território.',
          'Eliminar A: pele delicada e fina não descama nos primeiros dias — descamação fisiológica é comum.',
          'Eliminar B: manter cabecinha limpa e úmida para evitar desidratação do bebê — conduta incorreta.',
          'Eliminar D: pontinhos escurecidos no nariz desaparecem em até duas semanas — milium, mas não é o gabarito.',
          'Testar C: casquinhas no couro cabeludo — comuns e assintomáticas.',
          'Marcar letra C.',
          'Fixação: agente comunitário orienta família sobre pele do bebê.',
        ],
        footer_rule: 'C = casquinhas no couro cabeludo',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pele neonatal — ACS',
        meta: slideMeta,
        content: 'VISITA DOMICILIAR',
        rows: [
          { label: 'ACS', value: 'Apoiar famílias no cuidado ao bebê no território', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vernix caseosa', value: 'Camada de gordura protetora ao nascer', badge: 'ok' },
          { label: 'Descamação', value: 'Fisiológica nos primeiros dias de vida', badge: 'info' },
          { label: 'Casquinhas', value: 'Couro cabeludo — comuns, assintomáticas', badge: 'warn' },
        ],
        footer_rule: 'Primeira semana pós-parto — orientar pele do RN',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PELE DO RN',
        items: [
          {
            label: 'Letra A — não descama',
            detail: 'Nega descamação fisiológica neonatal.',
            correct: 'Pele delicada pode descamar nos primeiros dias — é esperado.',
          },
          {
            label: 'Letra B — cabeça úmida',
            detail: 'Conduta sem base para prevenir desidratação.',
            correct: 'Não se mantém cabeça úmida — hidratação é por aleitamento/oferta adequada.',
          },
          {
            label: 'Letra D — pontinhos no nariz',
            detail: 'Milium neonatal existe, mas gabarito é casquinhas.',
            correct: 'Casquinhas no couro cabeludo são afirmativa correta — letra C.',
          },
        ],
        footer_rule: 'Descamação e casquinhas = normal',
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
    console.log(`[handcraft:sc-g06] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g06] total=${ok}`);
}

main();
