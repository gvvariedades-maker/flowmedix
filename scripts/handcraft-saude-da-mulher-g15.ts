#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g15 (8 slugs parto P0).
 *
 *   npm run handcraft:saude-da-mulher-g15
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g15 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g15';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['pré-natal', 'puerpério', 'consulta pós-parto', 'leite materno', 'infecção puerperal'],
};

const OMS_PARTO_SOURCE = {
  id: 'oms-parto-humanizado',
  tier: 'A' as const,
  issuer: 'OMS / MS — PNH',
  title: 'Diretrizes Nacionais de Assistência ao Parto Normal — MS',
  year: 2017,
  url: 'https://www.who.int/publications/i/item/9789241550215',
  covers: ['hidratação oral no TP', 'parto humanizado', 'acupuntura parto', 'RPM vigilância'],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 26 — Planejamento familiar',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: ['métodos contraceptivos', 'DIU', 'injeção trimestral', 'amamentação'],
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

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis' | 'certo_errado';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  sources?: (typeof AB32_SOURCE | typeof OMS_PARTO_SOURCE | typeof PF_SOURCE)[];
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
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [OMS_PARTO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function cleanPuerperioNoise(s: string): string {
  return s
    .replace(/7o e o 10o dia/gi, 'primeira semana pós-parto')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'iaupe-enfermagem-saude-da-mulher-1777104424950-3': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS — Diretrizes Parto Normal: hidratação oral com soluções isotônicas no trabalho de parto',
    sources: [OMS_PARTO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Parto normal — MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Nascimento hospitalar, obstetrícia e mortalidade materna e perinatal.', icon: 'Target' },
          { label: 'Hidratação (A)', detail: 'Mulheres em trabalho de parto ingerem líquidos isotônicos.', icon: 'Droplet' },
          { label: 'Pegadinha clorexidina', detail: 'Antissépticos vulvares rotineiros — C falsa.', icon: 'Ban' },
          { label: 'Pegadinha acupuntura', detail: 'Acupuntura pode ser oferecida no TP — D falsa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Hidratação oral no TP — MS',
      },
      {
        type: 'golden_rule',
        slide_title: 'Parto normal — diretrizes',
        meta: slideMeta,
        content: 'PARTO NORMAL MS',
        rows: [
          { label: 'Hidratação', value: 'Líquidos isotônicos no trabalho de parto', badge: 'hot', emphasis: 'highlight' },
          { label: 'Analgesia', value: 'Métodos não farmacológicos incluindo acupuntura', badge: 'info' },
          { label: 'Higiene', value: 'Limpeza perineal conforme necessidade — não antisséptico universal', badge: 'warn' },
          { label: 'RPM', value: 'Ruptura prematura de membranas — vigilância de temperatura', badge: 'info' },
        ],
        footer_rule: 'Líquidos isotônicos no TP → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Parto normal — diretrizes nacionais MS.',
          'Testar A — ingestão de líquidos isotônicos.',
          'Eliminar B — CPN e planejamento (verdadeiro mas não é o foco).',
          'Eliminar C — antisséptico universal na vulva.',
          'Eliminar D — proibir acupuntura.',
          'Eliminar E — RPM isolada não é única recomendação.',
          'Marcar letra A.',
        ],
        footer_rule: 'Hidratação oral isotônica → A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARTO NORMAL',
        items: [
          { label: 'Letra B — CPN', detail: 'Apoio ao parto humanizado é política SUS.', correct: 'Hidratação no TP — letra A.' },
          { label: 'Letra C — clorexidina', detail: 'Limpeza não exige antisséptico rotineiro.', correct: 'Líquidos isotônicos — gabarito A.' },
          { label: 'Letra D — acupuntura', detail: 'Método não farmacológico permitido.', correct: 'Ingestão de líquidos — marcar A.' },
          { label: 'Letra E — RPM', detail: 'Vigilância existe mas não é única diretriz.', correct: 'Isotônicos no TP — letra A.' },
        ],
        footer_rule: 'Humanização e hidratação oral',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iaupe-enfermagem-saude-da-mulher-1777104424950-4': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 32 — pré-natal: inclusão do parceiro e mínimo de seis consultas',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-natal — MS',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Normas do Ministério da Saúde sobre pré-natal na APS.', icon: 'Target' },
          { label: 'Parceiro (E)', detail: 'Acompanhamento pré-natal inclui acesso masculino na faixa etária.', icon: 'Users' },
          { label: 'Pegadinha 4 consultas', detail: 'MS recomenda no mínimo seis consultas — D falsa.', icon: 'AlertTriangle' },
          { label: 'Pegadinha captação', detail: 'Início precoce — não só após metade da gestação — A.', icon: 'Clock' },
        ],
        footer_rule: 'Pré-natal ampliado ao parceiro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pré-natal — AB 32',
        meta: slideMeta,
        content: 'CONSULTAS MS',
        rows: [
          { label: 'Mínimo', value: 'Seis consultas distribuídas na gestação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Captação', value: 'Início precoce na APS de referência', badge: 'hot' },
          { label: 'Parceiro', value: 'Acesso masculino no pré-natal', badge: 'info' },
          { label: 'Alto risco', value: 'Referência sem abandonar vínculo na APS', badge: 'warn' },
        ],
        footer_rule: 'Inclusão do parceiro → E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pré-natal — normas MS na atenção básica.',
          'Eliminar A — captação só na metade da gestação.',
          'Eliminar B — alto risco só em intervalos fixos sem nuance.',
          'Eliminar C — alto risco apenas em referência.',
          'Eliminar D — mínimo de quatro consultas.',
          'Testar E — pré-natal também para o parceiro.',
          'Marcar letra E.',
        ],
        footer_rule: 'Parceiro no pré-natal → E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRÉ-NATAL',
        items: [
          { label: 'Letra A — 20ª semana', detail: 'Captação deve ser mais precoce.', correct: 'Inclusão do parceiro — letra E.' },
          { label: 'Letra B — alto risco', detail: 'Periodicidade individualizada.', correct: 'Acesso masculino no pré-natal — gabarito E.' },
          { label: 'Letra C — referência', detail: 'APS mantém vínculo.', correct: 'Parceiro na faixa etária — marcar E.' },
          { label: 'Letra D — 4 consultas', detail: 'MS estabelece no mínimo seis encontros pré-natal.', correct: 'Quatro consultas é insuficiente — gabarito E.' },
          { label: 'Pegadinha 4 consultas', detail: 'Número mínimo desatualizado na alternativa D.', correct: 'Pré-natal ampliado ao parceiro — letra E.' },
        ],
        footer_rule: 'Seis consultas — não quatro',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'iaupe-enfermagem-saude-da-mulher-1777104424950-6': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/FEGO — infecção puerperal: cesárea eleva risco infeccioso vs parto vaginal',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infecção puerperal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Infecção puerperal — morbimortalidade materna, prevenção nos serviços de saúde.', icon: 'Target' },
          { label: 'Cesárea (D)', detail: 'Partos cesarianos aumentam taxas de infecção puerperal.', icon: 'Scissors' },
          { label: 'Pegadinha febre', detail: 'Febre puerperal com critério temporal — B imprecisa.', icon: 'Clock' },
          { label: 'Pegadinha puerpério curto', detail: 'Assistência puerperal estende-se além do primeiro mês — até o 42º dia.', icon: 'Heart' },
        ],
        footer_rule: 'Cesárea ↑ infecção puerperal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Infecção — puerpério',
        meta: slideMeta,
        content: 'PUERPÉRIO INFECCIOSO',
        rows: [
          { label: 'Cesárea', value: 'Maior risco de infecção que parto vaginal', badge: 'hot', emphasis: 'highlight' },
          { label: 'Febre', value: 'Temperatura elevada após 48h do parto — definição clássica', badge: 'info' },
          { label: 'Complicações', value: 'DPI e infertilidade são sequelas possíveis', badge: 'warn' },
          { label: 'Mortalidade', value: 'Hemorragia e hipertensão ainda lideram causas evitáveis', badge: 'warn' },
          { label: 'Prevenção', value: 'Medidas de prevenção nos serviços de saúde pública', badge: 'info' },
        ],
        footer_rule: 'Cesárea e infecção → D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Infecção puerperal — afirmativas corretas.',
          'Eliminar A — definição ampla demais.',
          'Eliminar B — critério febril impreciso no enunciado.',
          'Eliminar C — infecção não supera hemorragia em mortalidade.',
          'Testar D — cesárea aumenta taxa de infecção.',
          'Eliminar E — limiar febril baixo demais.',
          'Marcar letra D.',
        ],
        footer_rule: 'Cesárea ↑ risco infeccioso → D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INFECÇÃO',
        items: [
          { label: 'Letra A — definição', detail: 'Febre puerperal tem critérios temporais.', correct: 'Definição ampla demais — cesárea aumenta risco infeccioso.' },
          { label: 'Letra B — febre', detail: 'Exclui primeiras horas pós-parto.', correct: 'Critério febril puerperal é mais específico — gabarito D.' },
          { label: 'Letra C — mortalidade', detail: 'Hemorragia puerperal ainda predomina.', correct: 'Infecção não supera hemorragia em mortalidade — marcar D.' },
          { label: 'Letra E — temperatura', detail: 'Limite baixo para investigar.', correct: 'Febre axilar baixa não exige protocolo infeccioso — D certa.' },
          { label: 'Pegadinha puerpério curto', detail: 'Vigilância infecciosa no ciclo gravídico-puerperal.', correct: 'Partos cesarianos elevam infecção puerperal — letra D.' },
        ],
        footer_rule: 'Prevenção na assistência obstétrica',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ibade-enfermagem-saude-da-mulher-1777104408379-4': {
    family: 'protocolo',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 32 — TE na APS: orientar gestante pela caderneta e sinais de alerta',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — APS gestação',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atuação do Técnico de Enfermagem na APS — gestação, parto e puerpério.', icon: 'Target' },
          { label: 'Caderneta (B)', detail: 'Conhecer e orientar itens da caderneta da gestante.', icon: 'BookOpen' },
          { label: 'Pegadinha centro cirúrgico', detail: 'Preparo de sala cirúrgica não é APS — A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha prescrição', detail: 'Solicitar USG e cardiotocografia é médico — E.', icon: 'Ban' },
        ],
        footer_rule: 'Orientação pela caderneta',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — papel APS',
        meta: slideMeta,
        content: 'TÉCNICO NA APS',
        rows: [
          { label: 'Faz', value: 'Orientar caderneta gestante e familiares', badge: 'hot', emphasis: 'highlight' },
          { label: 'Faz', value: 'Vigilância de sinais e encaminhamento', badge: 'hot' },
          { label: 'Não faz', value: 'Preparo cirúrgico ou prescrição de exames', badge: 'warn' },
          { label: 'Equipe', value: 'Nutrição e preparo físico são multiprofissionais', badge: 'info' },
        ],
        footer_rule: 'Caderneta e orientação → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'TE na APS — gestação e puerpério.',
          'Eliminar A — sala cirúrgica hospitalar.',
          'Testar B — caderneta da gestante.',
          'Eliminar C — atendimento nutricional exclusivo do TE.',
          'Eliminar D — preparo físico como atribuição isolada.',
          'Eliminar E — solicitar exames complementares.',
          'Marcar letra B.',
        ],
        footer_rule: 'Orientar caderneta → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE APS',
        items: [
          { label: 'Letra A — cirurgia', detail: 'Atribuição hospitalar especializada.', correct: 'Caderneta da gestante — letra B.' },
          { label: 'Letra C — nutrição', detail: 'Equipe multiprofissional compartilhada.', correct: 'Orientar gestante e família — gabarito B.' },
          { label: 'Letra D — preparo parto', detail: 'Pode apoiar mas não é única função TE.', correct: 'Conhecer caderneta — marcar B.' },
          { label: 'Letra E — exames', detail: 'Prescrição médica.', correct: 'Orientar caderneta da gestante — letra B.' },
          { label: 'Pegadinha centro cirúrgico', detail: 'Preparo de sala cirúrgica é atribuição hospitalar.', correct: 'Conhecer caderneta na APS — gabarito B.' },
          { label: 'Pegadinha prescrição', detail: 'Cardiotocografia e ultrassonografia não são solicitadas pelo TE.', correct: 'Orientação familiar na APS — marcar B.' },
        ],
        footer_rule: 'Escopo do técnico na APS',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idcap-enfermagem-saude-da-mulher-1777104389226-3': {
    family: 'conceito',
    branch: 'mulher_parto',
    guideline: 'MS — leite materno: colostro nos primeiros dias, mais proteínas e menos gorduras',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Leite materno — fases',
        meta: slideMeta,
        items: [
          { label: 'Lacuna', detail: 'Leite materno nos primeiros dias pós-parto — composição semelhante.', icon: 'Target' },
          { label: 'Colostro (B)', detail: 'Mais proteínas e menos gorduras que o leite maduro.', icon: 'Droplet' },
          { label: 'Pegadinha puerpério curto', detail: 'Secreção inicial no puerpério imediato — até acompanhamento no 42º dia.', icon: 'Clock' },
          { label: 'Pegadinha supina', detail: 'Posição no parto é tema distinto — foco aqui é lactação.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Primeiros dias = colostro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fases — leite',
        meta: slideMeta,
        content: 'AMAMENTAÇÃO',
        rows: [
          { label: 'Colostro', value: 'Primeiros dias — mais proteínas, menos gordura', badge: 'hot', emphasis: 'highlight' },
          { label: 'Transição', value: 'Fase intermediária após colostro', badge: 'info' },
          { label: 'Maduro', value: 'Estabelecido após primeira semana aproximada', badge: 'info' },
          { label: 'Universal', value: 'Composição adequada independente da dieta materna', badge: 'info' },
        ],
        footer_rule: 'Colostro preenche lacuna → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Composição do leite materno — lacuna.',
          'Eliminar A — leite de transição é posterior.',
          'Testar B — colostro.',
          'Eliminar C — leite maduro.',
          'Eliminar D — termo inexistente.',
          'Marcar letra B.',
        ],
        footer_rule: 'Primeiros dias → colostro — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LEITE',
        items: [
          { label: 'Letra A — transição', detail: 'Surge entre colostro e maduro.', correct: 'Fase inicial é colostro — não transição.' },
          { label: 'Letra C — maduro', detail: 'Fase tardia da lactação.', correct: 'Maduro vem após colostro e transição.' },
          { label: 'Letra D — equilibrado', detail: 'Termo não usado na classificação.', correct: 'Lacuna pede secreção dos primeiros dias.' },
          { label: 'Pegadinha puerpério curto', detail: 'Colostro no puerpério imediato pós-parto.', correct: 'Proteínas elevadas no colostro — letra B.' },
        ],
        footer_rule: 'Colostro → imunidade neonatal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-atencao-basica-saude-da-familia-1780067024707-1': {
    family: 'certo_errado',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 32 — consulta de puerpério: objetivos clínicos; salário-maternidade é burocracia previdenciária',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Consulta puerpério — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Objetivos da consulta de puerpério na USF — EXCETO.', icon: 'Target' },
          { label: 'Exceção (A)', detail: 'Salário-maternidade — documentação previdenciária, não objetivo clínico.', icon: 'XCircle' },
          { label: 'Pegadinha puerpério curto', detail: 'Consulta precoce e retorno até o 42º dia.', icon: 'Clock' },
          { label: 'Conduta clínica', detail: 'Identificar patologias e controlar comorbidades — C e D corretos.', icon: 'Stethoscope' },
        ],
        footer_rule: 'EXCETO burocracia previdenciária',
      },
      {
        type: 'golden_rule',
        slide_title: 'Consulta — puerpério',
        meta: slideMeta,
        content: 'PUERPÉRIO USF',
        rows: [
          { label: 'Objetivo', value: 'Avaliar mãe e RN — patologias e recuperação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Sexualidade', value: 'Orientar retorno da atividade sexual', badge: 'info' },
          { label: 'Comorbidades', value: 'Seguir anemia, DMG e síndromes hipertensivas', badge: 'info' },
          { label: 'Não é', value: 'Obter salário-maternidade na consulta clínica', badge: 'warn' },
        ],
        footer_rule: 'Salário-maternidade não é objetivo → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Consulta de puerpério — marcar EXCETO.',
          'Testar A — salário-maternidade: fora do objetivo clínico.',
          'Eliminar B — atividade sexual: é orientação puerperal.',
          'Eliminar C — patologias frequentes: é objetivo.',
          'Eliminar D — comorbidades gestacionais: é objetivo.',
          'Marcar letra A.',
        ],
        footer_rule: 'EXCETO documentação previdenciária — A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — CONSULTA PUERPÉRIO',
        items: [
          { label: 'Letra B — sexualidade', detail: 'Fornecer orientações sobre restabelecimento da atividade sexual do casal.', correct: 'Orientação correta sobre atividade sexual no puerpério.' },
          { label: 'Letra C — patologias', detail: 'Identificar patologias frequentes no puerpério.', correct: 'Afirmativa correta: avaliar condições maternas na consulta.' },
          { label: 'Letra D — comorbidades', detail: 'Controlar anemia, diabetes gestacional e síndromes hipertensivas.', correct: 'Conduta correta: acompanhar comorbidades manifestadas na gestação.' },
          { label: 'Pegadinha puerpério curto', detail: 'Consulta precoce com RN na USF.', correct: 'Não é objetivo clínico — letra A.' },
        ],
        footer_rule: 'Clínica ≠ previdência',
      },
    ],
    cleanInstruction: cleanPuerperioNoise,
  },

  'idib-enfermagem-saude-da-mulher-1778934944659-4': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS/Caderno AB 26 — DIU: contraindicado com risco de IST sem barreira',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Planejamento familiar — VF',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Planejamento familiar, direito reprodutivo e infecções sexualmente transmissíveis.', icon: 'Target' },
          { label: 'Item III (C)', detail: 'DIU, múltiplos parceiros e camisinha — afirmativa correta.', icon: 'CheckCircle' },
          { label: 'Pegadinha injeção', detail: 'Injeção trimestral na amamentação — item II falso.', icon: 'AlertTriangle' },
          { label: 'Pegadinha puerpério curto', detail: 'Métodos no puerpério e amamentação — vigilância até o 42º dia.', icon: 'Clock' },
        ],
        footer_rule: 'Só item III correto',
      },
      {
        type: 'golden_rule',
        slide_title: 'Métodos — MS',
        meta: slideMeta,
        content: 'PLANEJAMENTO FAMILIAR',
        rows: [
          { label: 'DIU', value: 'Múltiplos parceiros sem camisinha — cautela com DIU', badge: 'hot', emphasis: 'highlight' },
          { label: 'Injeção', value: 'Injeção trimestral compatível com amamentação', badge: 'info' },
          { label: 'Anticoncepcionais', value: 'Métodos masculinos ou femininos — escolha individual', badge: 'info' },
          { label: 'Tabela', value: 'Não método preferencial no puerpério', badge: 'warn' },
        ],
        footer_rule: 'Apenas III → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Planejamento familiar e infecções sexualmente transmissíveis — itens I a IV.',
          'Julgar I — métodos anticoncepcionais e gravidez → verdadeiro.',
          'Julgar II — injeção trimestral na amamentação → falso.',
          'Julgar III — DIU, parceiros e camisinha → verdadeiro.',
          'Julgar IV — tabela após parto → falso.',
          'Só o item III está correto.',
          'Marcar letra C.',
        ],
        footer_rule: 'DIU e risco de IST — item III — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MÉTODOS',
        items: [
          { label: 'Letra A — só I', detail: 'I é verdadeiro mas II e III também julgados.', correct: 'III isolado — letra C.' },
          { label: 'Letra B — só II', detail: 'Injeção trimestral compatível com lactação.', correct: 'DIU e preservativo — gabarito C.' },
          { label: 'Letra D — só IV', detail: 'Tabela não é método preferencial.', correct: 'Apenas item III — marcar C.' },
          { label: 'Pegadinha injeção', detail: 'Amenorreia é efeito comum da injeção.', correct: 'Item III correto — letra C.' },
        ],
        footer_rule: 'IST e DIU — barreira',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-saude-da-mulher-1777104261182-1': {
    family: 'vf',
    branch: 'mulher_parto',
    guideline: 'MS — TE em obstetrícia: apoio e vigilância; sem procedimentos invasivos autônomos',
    sources: [AB32_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'TE — gineco-obstetrícia',
        meta: slideMeta,
        items: [
          { label: 'Escopo', detail: 'Ginecologia e obstetrícia — pré-natal, parto, puerpério e promoção da saúde.', icon: 'Target' },
          { label: 'I e III (D)', detail: 'Afirmativas I e III verdadeiras; II falsa; IV verdadeira.', icon: 'CheckCircle' },
          { label: 'Pegadinha II', detail: 'Item II: TE não realiza procedimentos invasivos autônomos.', icon: 'AlertTriangle' },
          { label: 'Pegadinha IV', detail: 'Item IV: puerpério — sangramento e infecção.', icon: 'Heart' },
        ],
        footer_rule: 'I, II, III e IV — sequência V,F,V,V',
      },
      {
        type: 'golden_rule',
        slide_title: 'TE — obstetrícia',
        meta: slideMeta,
        content: 'PAPEL DO TE',
        rows: [
          { label: 'I', value: 'Pré-natal: observar intercorrências gestacionais', badge: 'hot', emphasis: 'highlight' },
          { label: 'II', value: 'TE sem procedimentos invasivos autônomos', badge: 'hot' },
          { label: 'III', value: 'Orientar sinais de alerta na gravidez', badge: 'info' },
          { label: 'IV', value: 'Puerpério: sangramento e infecção', badge: 'info' },
        ],
        footer_rule: 'Julgar I–IV: V, F, V, V → letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Enfermagem em ginecologia e obstetrícia — afirmativas I a IV.',
          'Julgar I — pré-natal: intercorrências gestacionais → verdadeiro.',
          'Julgar II — TE procedimentos invasivos autônomos → falso.',
          'Julgar III — sinais de alerta na gravidez → verdadeiro.',
          'Julgar IV — puerpério: sangramento e infecção → verdadeiro.',
          'Combinação V, F, V, V.',
          'Marcar letra D.',
        ],
        footer_rule: 'Itens I–IV julgados — sequência D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TE OBSTÉTRICO',
        items: [
          { label: 'Letra A — V,V,F,V', detail: 'Erro na afirmativa III — sinais de alerta.', correct: 'Item III verdadeiro — sequência D.' },
          { label: 'Letra B — F,V,V,F', detail: 'Afirmativa I é verdadeira no pré-natal.', correct: 'Vigilância gestacional — gabarito D.' },
          { label: 'Letra C — V,F,F,V', detail: 'Afirmativa III também é verdadeira.', correct: 'I–IV: V,F,V,V — marcar D.' },
          { label: 'Pegadinha II', detail: 'Item II falso — invasivo exige supervisão.', correct: 'Segunda afirmativa falsa — letra D.' },
        ],
        footer_rule: 'Protocolo e supervisão profissional',
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
    const { text_fragment: _drop, ...questionRest } = raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: { ...questionRest, instruction },
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sm-g15] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g15] total=${ok}`);
}

main();
