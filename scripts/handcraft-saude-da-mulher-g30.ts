#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g30 (8 slugs tail micro-ramos).
 *
 *   npm run handcraft:saude-da-mulher-g30
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g30 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g30';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-10';

const SM_SOURCE = {
  id: 'ms-saude-mulher-aps',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — saúde da mulher e APS',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: ['climatério', 'violência contra mulher', 'ciclo menstrual', 'PAISM'],
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

type Branch = 'mulher_generico';

type Pack = {
  family: 'conceito' | 'protocolo' | 'certo_errado';
  branch: Branch;
  guideline: string;
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
      exam_vs_current: 'none',
      catalog_slug: slug,
    },
    sources: [SM_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/polimenorreria/gi, 'polimenorreia')
    .replace(/sa\{de mental/g, 'saúde mental')
    .trim();
}

const SPECS: Record<string, Pack> = {
  'amauc-enfermagem-saude-da-mulher-1777104295283-8': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — climatério: TH individualizada; TE tem papel; complicações podem ser minimizadas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Climatério — assistência',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Climatério — transição reprodutiva — papel do técnico de enfermagem na APS.', icon: 'Target' },
          { label: 'TH orientada', detail: 'Informar terapia hormonal respeitando condições clínicas individuais.', icon: 'Heart' },
          { label: 'Pegadinha inevitável', detail: 'Complicações podem ser minimizadas com estilo de vida e prevenção.', icon: 'AlertTriangle' },
          { label: 'Pegadinha TE excluído', detail: 'Técnico participa do apoio psicológico e educação — não é só médico.', icon: 'Ban' },
        ],
        footer_rule: 'Educação ampla + TH individual — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Climatério — referência',
        meta: slideMeta,
        content: 'CLIMATÉRIO',
        rows: [
          { label: 'Assistência', value: 'Suporte físico, emocional e educativo na APS', badge: 'hot', emphasis: 'highlight' },
          { label: 'TH', value: 'Orientar com individualização clínica', badge: 'hot' },
          { label: 'Prevenção', value: 'Mudanças de estilo de vida minimizam complicações', badge: 'info' },
          { label: 'Pegadinha', value: 'Menopausa = cessação menstrual — não aumento de estrogênio', badge: 'warn' },
        ],
        footer_rule: 'Orientação integral — letra D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Climatério — assistência de enfermagem.',
          'Eliminar A — complicações podem ser minimizadas.',
          'Eliminar B — menopausa não mantém ciclos com mais estrogênio.',
          'Eliminar C — técnico tem papel no apoio.',
          'Testar D — orientação sobre terapia hormonal individualizada.',
          'Eliminar E — educação não se restringe a medicamentos.',
          'Marcar letra D.',
        ],
        footer_rule: 'TH com particularidades clínicas — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CLIMATÉRIO',
        items: [
          { label: 'Letra A — inevitável', detail: 'Estilo de vida e prevenção ajudam.', correct: 'Pegadinha inevitável — eliminar A; TH orientada.' },
          { label: 'Letra B — menopausa', detail: 'Cessação menstrual e queda hormonal.', correct: 'Pegadinha menopausa — eliminar B.' },
          { label: 'Letra C — só médico', detail: 'Equipe multiprofissional na APS.', correct: 'Técnico no apoio — eliminar C.' },
          { label: 'Letra E — só remédio', detail: 'Aspectos emocionais e sociais entram.', correct: 'Terapia hormonal — marcar D.' },
        ],
        footer_rule: 'Menopausa ≠ mais estrogênio',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'avancasp-enfermagem-saude-da-mulher-1777104323066-2': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — amenorreia: ausência de menstruação; investigar gravidez e causas em mulher jovem',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Amenorreia — caso',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Mulher 19 anos — ausência de menstruação há 3 meses — nomenclatura.', icon: 'Target' },
          { label: 'Amenorreia', detail: 'Ausência de menstruação — investigar gravidez e causas.', icon: 'Droplets' },
          { label: 'Pegadinha menopausa', detail: 'Menopausa não ocorre aos 19 anos.', icon: 'AlertTriangle' },
          { label: 'Pegadinha oligomenorreia', detail: 'Oligo = ciclos espaçados — ainda há menstruação.', icon: 'Ban' },
        ],
        footer_rule: 'Sem menstruação — amenorreia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ciclo — glossário',
        meta: slideMeta,
        content: 'MENSTRUAÇÃO',
        rows: [
          { label: 'Amenorreia', value: 'Ausência de menstruação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Oligomenorreia', value: 'Ciclos espaçados', badge: 'info' },
          { label: 'Dismenorreia', value: 'Dor menstrual', badge: 'info' },
          { label: 'Metrorragia', value: 'Sangramento fora do ciclo', badge: 'warn' },
        ],
        footer_rule: '3 meses sem menstruar — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ausência menstrual 3 meses — termo.',
          'Eliminar A — menopausa improvável aos 19 anos.',
          'Testar B — amenorreia.',
          'Eliminar C — dismenorreia é dor.',
          'Eliminar D — metrorragia é sangramento intermenstrual.',
          'Eliminar E — oligomenorreia ainda menstrua.',
          'Marcar letra B.',
        ],
        footer_rule: 'Amenorreia — ausência — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — AMENORREIA',
        items: [
          { label: 'Letra A — menopausa', detail: 'Fase do climatério — idade incompatível.', correct: 'Amenorreia — eliminar A.' },
          { label: 'Letra C — dismenorreia', detail: 'Dor, não ausência.', correct: 'Sem menstruação — eliminar C.' },
          { label: 'Letra D — metrorragia', detail: 'Sangramento irregular.', correct: 'Ausência 3 meses — eliminar D.' },
          { label: 'Letra E — oligomenorreia', detail: 'Ciclos espaçados.', correct: 'Amenorreia — marcar B.' },
        ],
        footer_rule: 'Jovem — investigar gravidez',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005540776-9': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — climatério/menopausa: risco cardiovascular aumenta; menopausa = 12 meses sem menstruação',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Menopausa × climatério',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Menopausa e climatério — afirmativa correta.', icon: 'Target' },
          { label: 'Risco cardiovascular', detail: 'Queda estrogênica potencializa risco circulatório.', icon: 'Heart' },
          { label: 'Pegadinha osteoporose', detail: 'Menos estrogênio aumenta — não diminui — osteoporose.', icon: 'AlertTriangle' },
          { label: 'Pegadinha patologia', detail: 'Climatério é fase fisiológica — não patologia por si só.', icon: 'Ban' },
        ],
        footer_rule: 'Risco cardiovascular — E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Climatério — MS',
        meta: slideMeta,
        content: 'MENOPAUSA',
        rows: [
          { label: 'Menopausa', value: '12 meses consecutivos sem menstruação', badge: 'hot', emphasis: 'highlight' },
          { label: 'Climatério', value: 'Transição com fogachos e irregularidade', badge: 'info' },
          { label: 'Risco CV', value: 'Alterações hormonais aumentam risco cardiovascular', badge: 'hot' },
          { label: 'Osteoporose', value: 'Queda estrogênica aumenta risco ósseo', badge: 'warn' },
        ],
        footer_rule: 'Circulatório potencializado — E',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Menopausa e climatério — conceitos.',
          'Eliminar A — irregularidade é climatério; menopausa é cessação.',
          'Eliminar B — climatério não é patologia obrigatória.',
          'Eliminar C — 12 meses sem menstruação define menopausa, não climatério inteiro.',
          'Eliminar D — osteoporose aumenta com queda estrogênica.',
          'Testar E — riscos cardiovasculares potencializados.',
          'Marcar letra E.',
        ],
        footer_rule: 'Hormônios e circulação — E',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MENOPAUSA',
        items: [
          { label: 'Letra A — fogachos', detail: 'Sintoma do climatério, não definição de menopausa.', correct: 'Risco cardiovascular — eliminar A.' },
          { label: 'Letra B — patologia', detail: 'Fase fisiológica.', correct: 'Alterações circulatórias — eliminar B.' },
          { label: 'Letra C — 12 meses', detail: 'Define menopausa, não todo climatério.', correct: 'Potencializa risco CV — eliminar C.' },
          { label: 'Letra D — osteoporose', detail: 'Risco ósseo aumenta.', correct: 'Risco cardiovascular — marcar E.' },
        ],
        footer_rule: 'Estrogênio ↓ — osso e coração',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-5': {
    family: 'protocolo',
    branch: 'mulher_generico',
    guideline: 'MS/PNH — violência contra mulher na APS: encaminhamento seguro, sem revitimização, acompanhamento contínuo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Violência — encaminhamento',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Violência doméstica e sexista — APS — encaminhamento na RAS.', icon: 'Target' },
          { label: 'Encaminhamento seguro', detail: 'Respeitar tempo e decisão da mulher — registrar e acompanhar.', icon: 'Shield' },
          { label: 'Pegadinha encaminhamento imediato', detail: 'Encaminhar imediato padronizado ignora revitimização — opção B falsa.', icon: 'AlertTriangle' },
          { label: 'Pegadinha encerrar APS', detail: 'Equipe mantém acompanhamento após encaminhar.', icon: 'Ban' },
        ],
        footer_rule: 'Sem revitimização — D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Violência — APS',
        meta: slideMeta,
        content: 'RAS / APS',
        rows: [
          { label: 'Encaminhar', value: 'Seguro, com consentimento e registro', badge: 'hot', emphasis: 'highlight' },
          { label: 'Acompanhar', value: 'APS não encerra após encaminhar', badge: 'hot' },
          { label: 'Revitimização', value: 'Evitar pressa e imposição', badge: 'warn' },
          { label: 'Equipe', value: 'Técnico organiza cuidado e articulação', badge: 'info' },
        ],
        footer_rule: 'Decisão da mulher — D',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Violência contra mulher — articulação intrassetorial.',
          'Eliminar A — encaminhamento sem desejo da mulher.',
          'Eliminar B — padronizar sem avaliar revitimização.',
          'Eliminar C — encerrar acompanhamento na APS.',
          'Testar D — encaminhamento seguro com registro e follow-up.',
          'Marcar letra D.',
        ],
        footer_rule: 'Respeito e acompanhamento — D',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ENCAMINHAR',
        items: [
          { label: 'Letra A — obrigatório', detail: 'Sem desejo da mulher.', correct: 'Encaminhamento seguro — eliminar A.' },
          { label: 'Letra B — imediato', detail: 'Encaminhamento padronizado sem avaliar revitimização.', correct: 'Pegadinha imediato — eliminar B; respeitar mulher.' },
          { label: 'Letra C — encerrar', detail: 'APS continua seguindo.', correct: 'Respeitar decisão — eliminar C.' },
        ],
        footer_rule: 'Rede sem abandono',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-6': {
    family: 'protocolo',
    branch: 'mulher_generico',
    guideline: 'MS — violência contra mulher: cuidado integral interprofissional — não exclusivo de uma categoria',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Violência — equipe',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Violência doméstica — trabalho interprofissional na equipe de saúde.', icon: 'Target' },
          { label: 'Integral', detail: 'Necessidades emocionais, psicológicas e de segurança — equipe ampla.', icon: 'Users' },
          { label: 'Pegadinha exclusiva SM', detail: 'Saúde mental não exclui técnico e enfermeiro.', icon: 'AlertTriangle' },
          { label: 'Pegadinha só físico', detail: 'Cuidado não se restringe à lesão imediata.', icon: 'Ban' },
        ],
        footer_rule: 'Interprofissional integral — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Violência — cuidado',
        meta: slideMeta,
        content: 'EQUIPE APS',
        rows: [
          { label: 'Integral', value: 'Físico, emocional, psicológico e segurança', badge: 'hot', emphasis: 'highlight' },
          { label: 'Interprofissional', value: 'Técnico, enfermeiro, médico, NASF', badge: 'hot' },
          { label: 'Pegadinha', value: 'Não padronizar ignorando competências', badge: 'warn' },
          { label: 'TE', value: 'Identifica necessidades e articula cuidado', badge: 'info' },
        ],
        footer_rule: 'Não exclusivo de um profissional — B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Violência — equipe interprofissional.',
          'Eliminar A — saúde mental não exclui técnico/enfermeiro.',
          'Testar B — necessidades integrais e trabalho em equipe.',
          'Eliminar C — só saúde física imediata.',
          'Eliminar D — abordagem padronizada sem competências.',
          'Marcar letra B.',
        ],
        footer_rule: 'Cuidado integral em equipe — B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EQUIPE',
        items: [
          { label: 'Letra A — só SM', detail: 'Competência exclusiva falsa — pegadinha saúde mental.', correct: 'Pegadinha exclusiva SM — eliminar A; equipe integral.' },
          { label: 'Letra C — só físico', detail: 'Ignora emocional e segurança.', correct: 'Pegadinha só físico — eliminar C.' },
          { label: 'Letra D — padronizar', detail: 'Desconsidera competências.', correct: 'Necessidades amplas — marcar B.' },
        ],
        footer_rule: 'TE participa do cuidado',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'itame-enfermagem-saude-da-mulher-1777104432986-1': {
    family: 'protocolo',
    branch: 'mulher_generico',
    guideline: 'MS — violência sexual: atendimento emergencial prioritário; BO não é obrigatório; notificação compulsória',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Violência sexual',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Violência contra mulher — saúde pública e direitos humanos.', icon: 'Target' },
          { label: 'Pegadinha atendimento imediato', detail: 'Violência sexual exige acolhimento emergencial prioritário — gabarito correto.', icon: 'AlertTriangle' },
          { label: 'Pegadinha BO', detail: 'Boletim de ocorrência não é obrigatório para atendimento.', icon: 'Ban' },
          { label: 'Pegadinha notificação', detail: 'Notificar suspeita — não só violência confirmada.', icon: 'Shield' },
        ],
        footer_rule: 'Atendimento emergencial — C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Violência — MS',
        meta: slideMeta,
        content: 'ATENDIMENTO',
        rows: [
          { label: 'Emergência', value: 'Violência sexual — prioridade imediata', badge: 'hot', emphasis: 'highlight' },
          { label: 'BO', value: 'Não condiciona atendimento em saúde', badge: 'info' },
          { label: 'Notificação', value: 'Compulsória — suspeita ou confirmação', badge: 'hot' },
          { label: 'Pegadinha', value: 'Notificação não é semanal isolada — ver norma vigente', badge: 'warn' },
        ],
        footer_rule: 'Sem regulação prévia — C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Violência contra mulher — alternativa correta.',
          'Eliminar A — notificar suspeita, não só confirmada.',
          'Eliminar B — BO não é indispensável.',
          'Testar C — atendimento emergencial prioritário.',
          'Eliminar D — notificação compulsória imediata, não semanal genérica.',
          'Marcar letra C.',
        ],
        footer_rule: 'Emergência sexual — C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VIOLÊNCIA',
        items: [
          { label: 'Letra A — só confirmada', detail: 'Notificar suspeita.', correct: 'Atendimento imediato emergencial — eliminar A.' },
          { label: 'Letra B — BO obrigatório', detail: 'Atendimento independente de BO.', correct: 'Pegadinha BO — eliminar B.' },
          { label: 'Letra D — semanal', detail: 'Prazo de notificação compulsória imediata.', correct: 'Emergência sexual — marcar C.' },
        ],
        footer_rule: 'Vítima não precisa de BO',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1778712437306-3': {
    family: 'certo_errado',
    branch: 'mulher_generico',
    guideline: 'MS — PAISM: assistência integral à saúde da mulher em todos os ciclos de vida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PAISM — C/E',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Programa de Assistência Integral à Saúde da Mulher — julgar Certo ou Errado.', icon: 'Target' },
          { label: 'Núcleo', detail: 'Acesso integrado em todos os ciclos de vida — prevenção, cura e planejamento reprodutivo.', icon: 'Heart' },
          { label: 'Pegadinha recorte', detail: 'Programa não restringe a um único ciclo ou só curativo.', icon: 'AlertTriangle' },
          { label: 'Pegadinha PF', detail: 'Planejamento reprodutivo integra o programa — não exclui.', icon: 'ListChecks' },
        ],
        footer_rule: 'Integral em todos os ciclos — Certo',
      },
      {
        type: 'golden_rule',
        slide_title: 'PAISM — referência',
        meta: slideMeta,
        content: 'SAÚDE DA MULHER',
        rows: [
          { label: 'PAISM', value: 'Assistência integral em qualquer ciclo de vida', badge: 'hot', emphasis: 'highlight' },
          { label: 'Níveis', value: 'Do mais simples ao mais complexo', badge: 'info' },
          { label: 'Ações', value: 'Prevenção, atenção curativa e planejamento reprodutivo', badge: 'info' },
          { label: 'Pegadinha', value: 'Não é programa só hospitalar', badge: 'warn' },
        ],
        footer_rule: 'Política integral — MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato Certo/Errado — PAISM.',
          'Ler afirmativa: acesso de todas as mulheres em qualquer ciclo.',
          'Verificar: serviços integrados simples ao complexo.',
          'Verificar: prevenção, cura e planejamento reprodutivo.',
          'Afirmativa alinhada ao programa — Certo.',
          'Marcar letra A (Certo).',
        ],
        footer_rule: 'Integralidade PAISM — Certo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E',
        items: [
          { label: 'Letra B — Errado', detail: 'Distrator único.', correct: 'Programa integral em todos os ciclos — Certo.' },
          { label: 'Pegadinha recorte', detail: 'Negar planejamento reprodutivo ou um único ciclo de vida.', correct: 'PAISM cobre prevenção, cura e PF — marcar Certo.' },
        ],
        footer_rule: 'Errado negaria integralidade',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067036141-1': {
    family: 'conceito',
    branch: 'mulher_generico',
    guideline: 'MS — polimenorreia: ciclos menstruais frequentes; amenorreia = ausência; hipermenorreia = volume',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Polimenorreia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Sintomas ginecológicos — dor, ciclos, hemorragias, corrimento — polimenorreia.', icon: 'Target' },
          { label: 'Polimenorreia', detail: 'Ciclos menstruais frequentes — intervalo curto.', icon: 'Clock' },
          { label: 'Pegadinha amenorreia', detail: 'Amenorreia = ausência de menstruação.', icon: 'AlertTriangle' },
          { label: 'Pegadinha hipermenorreia', detail: 'Hipermenorreia = volume aumentado — não frequência.', icon: 'Ban' },
        ],
        footer_rule: 'Ciclos frequentes — B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Ciclo — termos',
        meta: slideMeta,
        content: 'MENSTRUAÇÃO',
        rows: [
          { label: 'Polimenorreia', value: 'Ciclos menstruais frequentes', badge: 'hot', emphasis: 'highlight' },
          { label: 'Amenorreia', value: 'Ausência de menstruação', badge: 'info' },
          { label: 'Hipermenorreia', value: 'Aumento do volume sanguíneo', badge: 'warn' },
          { label: 'Oligomenorreia', value: 'Ciclos espaçados', badge: 'info' },
        ],
        footer_rule: 'Frequência alta — polimenorreia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Polimenorreia — definição.',
          'Eliminar A — ausência é amenorreia.',
          'Testar B — ciclos menstruais frequentes.',
          'Eliminar C — volume é hipermenorreia.',
          'Eliminar D — ciclos diminuídos é oligomenorreia.',
          'Marcar letra B.',
        ],
        footer_rule: 'Intervalo curto — letra B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FREQUÊNCIA',
        items: [
          { label: 'Letra A — ausência', detail: 'Amenorreia.', correct: 'Ciclos frequentes — eliminar A.' },
          { label: 'Letra C — volume', detail: 'Hipermenorreia.', correct: 'Polimenorreia — eliminar C.' },
          { label: 'Letra D — espaçados', detail: 'Oligomenorreia.', correct: 'Frequentes — marcar B.' },
        ],
        footer_rule: 'Poli = muitos ciclos',
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
    console.log(`[handcraft:sm-g30] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g30] total=${ok}`);
}

main();
