#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-crianca-g07 (8 slugs).
 *
 *   npx tsx scripts/handcraft-saude-da-crianca-g07.ts
 *   npm run validate:goldens -- --lote=saude-da-crianca-g07 --strict
 *   npm run audit:questao-readiness -- --lote=saude-da-crianca-g07 --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { SAUDE_CRIANCA_MS } from '@/lib/guidelines/saudeCrianca';

const LOTE = 'saude-da-crianca-g07';
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
    '5º dia saúde integral',
    'calendário puericultura',
    'visita domiciliar RN',
    'aleitamento materno',
    'teste do pezinho',
    'antropometria neonatal',
    'cefalohematoma',
    'doença de Perthes',
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
  | 'crianca_aps_puericultura'
  | 'crianca_aleitamento_nutricao'
  | 'crianca_neonatologia'
  | 'crianca_generico';

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
    .replace(/sertriadas/gi, 'ser triadas')
    .replace(/recém nascido/gi, 'recém-nascido')
    .replace(/recém nascidas/gi, 'recém-nascidas')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-7': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: '5º Dia de Saúde Integral — vacinação e triagem neonatal (MS / Caderneta)',
    slides: [
      {
        type: 'concept_map',
        slide_title: '5º Dia de Saúde Integral',
        meta: slideMeta,
        items: [
          { label: 'Janela', detail: 'Entre o 3º e 5º dia — comparecimento à UBS com o RN.', icon: 'Calendar' },
          { label: 'ACS', detail: 'Orientar pais sobre ações do 5º Dia de Saúde Integral.', icon: 'Users' },
          { label: 'Vacinação', detail: 'Poliomielite oral e BCG no retorno do 5º dia.', icon: 'Syringe' },
          { label: 'Pegadinha', detail: 'Triagem e orientações também ocorrem — banca destaca vacinação.', icon: 'AlertTriangle' },
        ],
        footer_rule: '5º dia: vacinar polio + BCG na UBS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ações do 5º Dia de Saúde Integral (3º–5º dia de vida).',
          'A — triagem neonatal: ação do dia, mas não é o foco cobrado.',
          'B — amamentação e planejamento familiar: orientação pertinente, não a resposta.',
          'D — cuidados e sinais de alerta: também previstos, mas distrator.',
          'C — vacinação contra poliomielite e tuberculose (BCG): ação central do 5º dia.',
          'Marcar letra C.',
          'Fixação: 5º dia = vacinar BCG + poliomielite na UBS.',
        ],
        footer_rule: 'Gabarito C — vacinação no 5º dia',
      },
      {
        type: 'golden_rule',
        slide_title: '5º Dia — referência MS',
        meta: slideMeta,
        content: 'SAÚDE INTEGRAL DO RN',
        rows: [
          { label: 'Período', value: '3º ao 5º dia de vida', badge: 'hot', emphasis: 'highlight' },
          { label: 'Vacinas', value: 'BCG + poliomielite oral', badge: 'ok' },
          { label: 'Também no dia', value: 'Triagem neonatal, orientações, sinais de alerta', badge: 'info' },
          { label: 'Pegadinha', value: 'Não confundir ação principal com itens secundários', badge: 'warn' },
        ],
        footer_rule: 'Vacinação BCG + polio no 5º dia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — 5º DIA',
        items: [
          {
            label: 'Letra A — triagem neonatal',
            detail: 'Pezinho e avaliações fazem parte do 5º dia.',
            correct: 'Triagem neonatal é ação prevista — letra C (vacinação) é o gabarito desta questão.',
          },
          {
            label: 'Letra B — AME e planejamento familiar',
            detail: 'Orientação à família no retorno à UBS.',
            correct: 'Orientações sobre amamentação são conduta correta — não a resposta pedida.',
          },
          {
            label: 'Letra D — cuidados e sinais de alerta',
            detail: 'Educação em saúde ao cuidador.',
            correct: 'Cuidados e sinais de alerta são orientados — vacinação BCG/polio é letra C.',
          },
        ],
        footer_rule: 'Vacinação = resposta da banca',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968125784-8': {
    family: 'conceito',
    branch: 'crianca_aps_puericultura',
    guideline: 'Calendário de consultas de puericultura — MS (Caderneta)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Calendário de puericultura',
        meta: slideMeta,
        items: [
          { label: '1º ano', detail: 'Sete consultas de rotina — acompanhamento intensivo.', icon: 'Calendar' },
          { label: '2º ano', detail: 'Três consultas conforme MS.', icon: 'Baby' },
          { label: '3º ano', detail: 'Duas consultas.', icon: 'Users' },
          { label: '≥5 anos', detail: 'Consultas anuais.', icon: 'School' },
        ],
        footer_rule: '1º ano = 7 consultas de rotina',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: calendário de consultas de puericultura (MS).',
          'Eliminar A: três no 2º ano — verdadeiro, mas não responde ao eixo do gabarito.',
          'Eliminar B: duas no 3º ano — verdadeiro parcial.',
          'Eliminar C: anuais a partir do 5º ano — verdadeiro parcial.',
          'Testar D: sete consultas de rotina no primeiro ano de vida.',
          'Marcar letra D.',
          'Fixação: 7 no 1º ano · 3 no 2º · 2 no 3º · anual ≥5 anos.',
        ],
        footer_rule: 'D = 7 consultas no 1º ano',
      },
      {
        type: 'golden_rule',
        slide_title: 'Consultas MS',
        meta: slideMeta,
        content: 'PUERICULTURA',
        rows: [
          { label: '1º ano', value: '7 consultas de rotina', badge: 'hot', emphasis: 'highlight' },
          { label: '2º ano', value: '3 consultas', badge: 'ok' },
          { label: '3º ano', value: '2 consultas', badge: 'ok' },
          { label: '≥5 anos', value: 'Consultas anuais', badge: 'info' },
        ],
        footer_rule: 'ACS faz busca ativa dos faltosos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CALENDÁRIO',
        items: [
          {
            label: 'Letra A — 3 consultas no 2º ano',
            detail: 'Afirmativa correta para o 2º ano, mas não é o gabarito pedido.',
            correct: 'MS prevê 3 consultas no 2º ano — alternativa verdadeira, não a resposta central.',
          },
          {
            label: 'Letra B — 2 no 3º ano',
            detail: 'Correto para o 3º ano.',
            correct: 'Duas consultas no 3º ano estão no calendário — gabarito foca no 1º ano (D).',
          },
          {
            label: 'Letra C — anuais ≥5 anos',
            detail: 'Conduta correta após os 5 anos.',
            correct: 'Consultas anuais a partir do 5º ano — verdadeiro, mas D é a marca registrada do 1º ano.',
          },
        ],
        footer_rule: 'Decore: 7-3-2-anual',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulplan-enfermagem-atencao-basica-saude-da-familia-1778968144588-0': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Primeira visita domiciliar ao RN — objetivos (CAB MS)',
    exam_vs_current: 'Prova cita AME exclusivo até 2º mês — MS/OMS recomendam exclusivo até 6 meses.',
    slides: [
      {
        type: 'concept_map',
        slide_title: '1ª visita domiciliar — RN',
        meta: slideMeta,
        items: [
          { label: 'Objetivos', detail: 'Vínculo, acesso à UBS, sinais de alerta, depressão puerperal.', icon: 'Home' },
          { label: 'Relações familiares', detail: 'Observar dinâmica e suporte ao cuidado.', icon: 'Users' },
          { label: 'AME', detail: 'Promover amamentação — MS: exclusivo até 6 meses.', icon: 'Baby' },
          { label: 'EXCETO', detail: 'AME exclusivo só até 2º mês — prazo inferior ao MS.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'AME exclusivo MS = 6 meses, não 2 meses',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando EXCETO: objetivos da 1ª visita domiciliar ao RN.',
          'A — observar relações familiares: objetivo válido.',
          'B — facilitar acesso ao serviço de saúde: objetivo válido.',
          'C — identificar depressão puerperal: objetivo válido.',
          'D — AME exclusivo até 2º mês: NÃO é objetivo MS (exclusivo até 6 meses).',
          'Marcar letra D (EXCETO).',
          'Fixação: promover AME — meta 6 meses exclusivo.',
        ],
        footer_rule: 'EXCETO D — 2 meses ≠ política MS',
      },
      {
        type: 'golden_rule',
        slide_title: 'Visita domiciliar — RN',
        meta: slideMeta,
        content: 'PRIMEIRA VISITA',
        rows: [
          { label: 'Observar', value: 'Relações familiares e cuidados', badge: 'ok' },
          { label: 'Facilitar', value: 'Acesso à rede de saúde', badge: 'ok' },
          { label: 'Rastrear', value: 'Depressão puerperal', badge: 'info' },
          { label: 'AME MS', value: 'Exclusivo até 6 meses — não só 2º mês', badge: 'hot', emphasis: 'highlight' },
        ],
        footer_rule: 'Visita acolhe e conecta família à UBS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO VISITA',
        items: [
          {
            label: 'Letra A — relações familiares',
            detail: 'Avaliação do contexto familiar é objetivo da visita.',
            correct: 'Observar relações familiares é meta legítima — não é o EXCETO.',
          },
          {
            label: 'Letra B — acesso ao serviço',
            detail: 'Vincular família à UBS.',
            correct: 'Facilitar acesso à saúde é objetivo da visita domiciliar.',
          },
          {
            label: 'Letra C — depressão puerperal',
            detail: 'Rastreio de saúde mental materna.',
            correct: 'Identificar depressão puerperal é objetivo — não marca EXCETO.',
          },
        ],
        footer_rule: 'A–C são objetivos; D limita AME a 2 meses',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-verbena-enfermagem-atencao-basica-saude-da-familia-1778968194611-1': {
    family: 'conceito',
    branch: 'crianca_aleitamento_nutricao',
    guideline: 'Visita domiciliar pós-parto — prazo até o 5º dia (CAB MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Visita domiciliar — RN',
        meta: slideMeta,
        items: [
          { label: 'ACS', detail: 'Visita domiciliar após o parto da mulher — avaliar recém-nascido e família.', icon: 'Home' },
          { label: 'Avaliar', detail: 'Estado de hidratação, aleitamento, icterícia, coto umbilical, situação vacinal e outras avaliações pertinentes.', icon: 'Stethoscope' },
          { label: 'Prazo MS', detail: 'Primeira visita até o 5º dia de vida.', icon: 'Calendar' },
          { label: 'Pegadinha', detail: 'Prazos na 2ª–4ª semana atrasam contato precoce.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Visita até o 5º dia pós-nascimento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: prazo da visita domiciliar do agente comunitário após o nascimento do recém-nascido.',
          'Eliminar A: 28º dia — tardio demais para primeira visita.',
          'Eliminar B: 15º dia — fora do prazo precoce.',
          'Eliminar C: prazo na 2ª semana — além do limite do 5º dia.',
          'Testar D: até o 5º dia.',
          'Marcar letra D.',
          'Fixação: contato precoce = até 5º dia.',
        ],
        footer_rule: 'D = até o 5º dia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Visita pós-parto',
        meta: slideMeta,
        content: 'ACS — RN',
        rows: [
          { label: 'Prazo', value: 'Até o 5º dia de vida', badge: 'hot', emphasis: 'highlight' },
          { label: 'Avaliar', value: 'AME, icterícia, coto, hidratação', badge: 'ok' },
          { label: '1ª semana', value: 'Também retorno UBS (5º Dia Saúde Integral)', badge: 'info' },
          { label: 'Busca ativa', value: 'Se família não comparecer', badge: 'warn' },
        ],
        footer_rule: '5º dia = visita domiciliar + UBS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRAZO DA VISITA',
        items: [
          {
            label: 'Letra A — 28º dia',
            detail: 'Um mês após o parto — muito tardio.',
            correct: 'Primeira visita deve ocorrer até o 5º dia — não o 28º.',
          },
          {
            label: 'Letra B — 15º dia',
            detail: 'Segunda semana — perde janela crítica.',
            correct: 'MS orienta visita precoce até o 5º dia de vida.',
          },
          {
            label: 'Letra C — prazo na 2ª semana',
            detail: 'Ainda além do limite recomendado.',
            correct: 'Letra D: visita até o 5º dia pós-nascimento.',
          },
        ],
        footer_rule: 'Não postergar além do 5º dia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'intec-enfermagem-coleta-de-exames-laboratoriais-1779563248005-7': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Teste do Pezinho — técnica de coleta PNTN (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pezinho — afirmativa errada',
        meta: slideMeta,
        items: [
          { label: 'PNTN', detail: 'Programa Nacional de Triagem Neonatal — universal para recém-nascidos.', icon: 'Activity' },
          { label: 'Doenças', detail: 'Rastreio inclui doença falciforme e outras detectáveis no filtro.', icon: 'Droplets' },
          { label: 'Janela', detail: '3º ao 5º dia de vida — afirmativa correta.', icon: 'Calendar' },
          { label: 'Local', detail: 'Punção lateral do calcanhar com lanceta — não hálux.', icon: 'Syringe' },
          { label: 'Posição', detail: 'Recém-nascido posicionado com pé abaixo do coração.', icon: 'Baby' },
        ],
        footer_rule: 'Coleta no calcanhar lateral — não hálux',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinale a opção errada sobre o Teste do Pezinho no Programa Nacional de Triagem Neonatal.',
          'A — 3º ao 5º dia: correta.',
          'C — pé abaixo do coração: correta.',
          'D — lancetas: correta.',
          'B — sangue no hálux: ERRADA — local é calcanhar lateral.',
          'Marcar letra B.',
          'Fixação: hálux ≠ sítio de coleta do pezinho.',
        ],
        footer_rule: 'ERRADA = B — hálux não é sítio de coleta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Coleta PNTN',
        meta: slideMeta,
        content: 'TESTE DO PEZINHO',
        rows: [
          { label: 'Momento', value: '3º ao 5º dia', badge: 'ok' },
          { label: 'Local correto', value: 'Lateral do calcanhar', badge: 'hot', emphasis: 'highlight' },
          { label: 'Errado', value: 'Hálux (polegar do pé)', badge: 'warn' },
          { label: 'Técnica', value: 'Lanceta estéril + posição pé pendente', badge: 'info' },
        ],
        footer_rule: 'Calcanhar lateral — nunca hálux',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PEZINHO ERRADA',
        items: [
          {
            label: 'Letra A — 3º ao 5º dia',
            detail: 'Janela correta do MS.',
            correct: 'Entre 3º e 5º dia é conduta correta — não é a afirmativa errada.',
          },
          {
            label: 'Letra C — pé abaixo do coração',
            detail: 'Posicionamento facilita coleta capilar.',
            correct: 'Posição com pé pendente é técnica adequada — não marca ERRADA.',
          },
          {
            label: 'Letra D — lancetas',
            detail: 'Instrumento apropriado para punção.',
            correct: 'Coleta com lanceta estéril é correta — gabarito B (hálux).',
          },
        ],
        footer_rule: 'A, C, D corretas; B troca o sítio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'quadrix-enfermagem-saude-da-crianca-1780001362784-6': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Perímetro torácico no RN — medida na altura dos mamilos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Perímetro torácico — RN',
        meta: slideMeta,
        items: [
          { label: 'Antropometria', detail: 'Peso, comprimento e perímetros no RN.', icon: 'Ruler' },
          { label: 'Técnica', detail: 'Fita métrica em volta do tórax em nível definido.', icon: 'Circle' },
          { label: 'Referência', detail: 'Altura dos mamilos — ponto padrão no lactente.', icon: 'Target' },
          { label: 'Pegadinha', detail: '2º espaço intercostal, diafragma, ombros ou estômago.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Perímetro torácico = altura dos mamilos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nível da fita no perímetro torácico do RN.',
          'Eliminar A: 2º espaço intercostal — referência de FR, não perímetro.',
          'Eliminar B: estômago — nível abdominal.',
          'Eliminar C: diafragma — impreciso para perímetro torácico.',
          'Eliminar D: ombros — acima do tórax.',
          'Testar E: altura dos mamilos.',
          'Marcar letra E.',
        ],
        footer_rule: 'Gabarito E — mamilos na fita métrica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Medida antropométrica',
        meta: slideMeta,
        content: 'PERÍMETRO TORÁCICO',
        rows: [
          { label: 'Nível', value: 'Altura dos mamilos', badge: 'hot', emphasis: 'highlight' },
          { label: 'Técnica', value: 'Fita snug, fim da expiração', badge: 'ok' },
          { label: 'Não usar', value: 'Ombros, diafragma, abdome', badge: 'warn' },
          { label: 'Contexto', value: 'Avaliar simetria e crescimento torácico', badge: 'info' },
        ],
        footer_rule: 'Mamilos = marco anatômico padrão',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PERÍMETRO TORÁCICO',
        items: [
          {
            label: 'Letra A — 2º espaço intercostal',
            detail: 'Usado para contagem de FR, não perímetro.',
            correct: 'Perímetro torácico mede-se na altura dos mamilos — não 2º EIC.',
          },
          {
            label: 'Letra B — estômago',
            detail: 'Nível abdominal, não torácico.',
            correct: 'Abdome ≠ tórax — gabarito E (mamilos).',
          },
          {
            label: 'Letra C — diafragma',
            detail: 'Limite impreciso para fita métrica.',
            correct: 'Referência padrão: mamilos na linha mamilar.',
          },
          {
            label: 'Letra D — ombros',
            detail: 'Acima do perímetro torácico.',
            correct: 'Fita na altura dos mamilos — não na linha dos ombros.',
          },
        ],
        footer_rule: 'Decore: mamilos',
      },
    ],
  },

  'reis-e-reis-enfermagem-semiologia-em-enfermagem-1779563521756-7': {
    family: 'conceito',
    branch: 'crianca_triagem_neonatal',
    guideline: 'Cefalohematoma — coleção subperiosteal no RN (trauma de parto)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cefalohematoma',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Coleção sanguínea subperiosteal na abóbada craniana.', icon: 'Circle' },
          { label: 'Parto', detail: 'Associado a parto laborioso e uso de fórceps.', icon: 'Baby' },
          { label: 'Limites', detail: 'Confina aos limites de um osso — não cruza suturas.', icon: 'Bone' },
          { label: 'Diferencial', detail: 'Bossa serossanguínea cruza suturas — cefalohematoma não.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Cefalohematoma = subperiosteal, pós-parto traumático',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: coleção sanguínea na abóbada após parto laborioso/fórceps.',
          'Eliminar B: craniossinostose — fusão prematura de suturas.',
          'Eliminar C: bossa serossanguínea — edema/hematoma subgaleal, cruza suturas.',
          'Eliminar D: fenilcetonúria — doença metabólica, não trauma de parto.',
          'Testar A: cefalohematoma.',
          'Marcar letra A.',
          'Fixação: subperiosteal + limitado ao osso.',
        ],
        footer_rule: 'A = cefalohematoma',
      },
      {
        type: 'golden_rule',
        slide_title: 'Trauma cefálico neonatal',
        meta: slideMeta,
        content: 'COLEÇÃO NA ABÓBADA',
        rows: [
          { label: 'Cefalohematoma', value: 'Subperiosteal — limitado a um osso', badge: 'hot', emphasis: 'highlight' },
          { label: 'Bossa', value: 'Subgaleal — cruza suturas, regride', badge: 'ok' },
          { label: 'Fórceps', value: 'Fator de risco', badge: 'info' },
          { label: 'Evolução', value: 'Pode calcificar — acompanhar', badge: 'warn' },
        ],
        footer_rule: 'Não confundir bossa × cefalohematoma',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ABÓBADA CRANIANA',
        items: [
          {
            label: 'Letra B — craniossinostose',
            detail: 'Malformação congênita de suturas.',
            correct: 'Não é coleção pós-parto — é fusão prematura de suturas.',
          },
          {
            label: 'Letra C — bossa serossanguínea',
            detail: 'Edema/hemorragia subgaleal que cruza suturas.',
            correct: 'Bossa regride em dias — cefalohematoma é subperiosteal limitado.',
          },
          {
            label: 'Letra D — fenilcetonúria',
            detail: 'Erro inato do metabolismo — sem relação com trauma.',
            correct: 'Coleção pós-parto traumático = cefalohematoma — letra A.',
          },
        ],
        footer_rule: 'Parto difícil + coleção = cefalohematoma',
      },
    ],
  },

  'selecon-enfermagem-exames-complementares-1779563668619-4': {
    family: 'conceito',
    branch: 'crianca_generico',
    guideline: 'Doença de Perthes — diagnóstico por RX e ressonância magnética',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Doença de Perthes',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Necrose avascular da cabeça femoral em crianças.', icon: 'Bone' },
          { label: 'Quadro', detail: 'Claudicação, dor em quadril, maior incidência masculina.', icon: 'Activity' },
          { label: 'RX', detail: 'Primeira linha — alterações ósseas e colapso.', icon: 'Scan' },
          { label: 'RM', detail: 'Maior precisão precoce — edema e perfusão.', icon: 'Brain' },
        ],
        footer_rule: 'Perthes: RX + RM para precisão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: exames para maior precisão diagnóstica na Perthes.',
          'Eliminar A: RX + cintilografia — RM é mais precisa que cintilografia.',
          'Eliminar C: US + RM — ultrassom limitado para cabeça femoral.',
          'Eliminar D: angiografia + TC — invasivo/desnecessário como rotina.',
          'Testar B: radiografia e ressonância magnética.',
          'Marcar letra B.',
          'Fixação: RX inicial + RM para estadiamento.',
        ],
        footer_rule: 'Gabarito B — radiografia e ressonância',
      },
      {
        type: 'golden_rule',
        slide_title: 'Perthes — imagem',
        meta: slideMeta,
        content: 'NECROSE CABEÇA FEMORAL',
        rows: [
          { label: 'RX', value: 'Avalia colapso e estágio', badge: 'ok' },
          { label: 'RM', value: 'Detecta edema e necrose precoce', badge: 'hot', emphasis: 'highlight' },
          { label: 'Combo', value: 'Radiografia + ressonância magnética', badge: 'hot' },
          { label: 'US', value: 'Complementar — não substitui RM', badge: 'info' },
        ],
        footer_rule: 'Suspeita clínica → RX + RM',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PERTHES',
        items: [
          {
            label: 'Letra A — RX + cintilografia',
            detail: 'Cintilografia útil, mas RM é padrão para precisão.',
            correct: 'Maior precisão: radiografia + ressonância magnética — não cintilografia isolada.',
          },
          {
            label: 'Letra C — US + RM',
            detail: 'Ultrassom tem papel limitado no quadril.',
            correct: 'RX + RM é o par indicado — não US como exame principal.',
          },
          {
            label: 'Letra D — angiografia + TC',
            detail: 'Exames invasivos/alta radiação sem indicação de rotina.',
            correct: 'Gabarito B: radiografia e ressonância magnética.',
          },
        ],
        footer_rule: 'Imagem de quadril pediátrico: RX + RM',
      },
    ],
    cleanInstruction: (s) => cleanPdfNoise(s).replace(/eapresenta/gi, ' e apresenta'),
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
    console.log(`[handcraft:sc-g07] OK ${slug}`);
  }
  console.log(`[handcraft:sc-g07] total=${ok}`);
}

main();
