#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g06 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g06
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g06';
const SUBTOPICO = 'Promoção à Saúde e Prevenção de Agravos';
const REVIEWED = '2026-07-20';

const MS_PROMOCAO_SOURCE = {
  id: PROMOCAO_SAUDE_SUS.id,
  tier: 'A' as const,
  issuer: PROMOCAO_SAUDE_SUS.issuer,
  title: PROMOCAO_SAUDE_SUS.title,
  year: PROMOCAO_SAUDE_SUS.year,
  url: PROMOCAO_SAUDE_SUS.url,
  covers: [
    'princípios do SUS',
    'educação em saúde',
    'prevenção de agravos',
    'promoção da saúde',
    'história natural da doença',
    'níveis de prevenção',
  ],
};

const LEI_8080_SOURCE = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 8.080/1990 — Lei Orgânica da Saúde',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
  covers: ['integralidade', 'acolhimento', 'atenção primária'],
};

type Opt = { id: string; text: string; is_correct: boolean };
type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: Opt[] };
  modulo_slug?: string;
};

type Branch =
  | 'promocao_educacao_prevencao'
  | 'promocao_principios_direitos'
  | 'promocao_generico';

type Pack = {
  family: 'legis' | 'certo_errado' | 'conceito' | 'protocolo' | 'vf';
  branch: Branch;
  guideline: string;
  sources?: (typeof MS_PROMOCAO_SOURCE | typeof LEI_8080_SOURCE)[];
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    topico: String(q.meta.topico ?? 'Enfermagem'),
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
    sources: pack.sources ?? [MS_PROMOCAO_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\bvariamem\b/gi, 'variam em')
    .replace(/\bcoletivamentevínculos\b/gi, 'coletivamente vínculos')
    .replace(/\béum\b/gi, 'é um')
    .replace(/\boutrossão\b/gi, 'outros são')
    .replace(/\bretardando asconsequências\b/gi, 'retardando as consequências')
    .replace(/\bmaisadequada\b/gi, 'mais adequada')
    .replace(/\bdiária,entre\b/gi, 'diária, entre')
    .replace(/\bsistêmicos\(p\./gi, 'sistêmicos (p.')
    .replace(/\bparafalsas\b/gi, 'para falsas')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfNoise(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfNoise(o.text) })),
  };
}

const SPECS: Record<string, Pack> = {
  'fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-8': {
    family: 'vf',
    branch: 'promocao_generico',
    guideline: 'Diário do cuidador — Guia Prático do Cuidador (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diário do cuidador',
        meta: slideMeta,
        items: [
          { label: 'Registro cronológico', detail: 'Dados da pessoa cuidada, saúde e atividades da vida diária.', icon: 'ClipboardList' },
          { label: 'Conteúdo', detail: 'Medicamentos, sinais vitais, alimentação, higiene, eliminações, sono.', icon: 'FileText' },
          { label: 'Atualização', detail: 'Registros ao longo do cuidado — não só no início do plantão.', icon: 'Clock' },
          { label: 'Comunicação', detail: 'Instrumento de troca com a equipe de saúde.', icon: 'Users' },
          { label: 'Pegadinha turno', detail: '“Só no início do plantão” invalida o item III.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Diário = registro contínuo e cronológico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativas corretas sobre o diário do cuidador.',
          'I: informações claras em ordem cronológica — CORRETA.',
          'II: propriedade exclusiva do cuidador com acesso amplo — interpretação da banca não fecha com I e IV.',
          'III: registro sempre só no início do turno — INCORRETA (deve ser contínuo).',
          'IV: medicamentos, sinais vitais, alimentação, higiene, intercorrências — CORRETA.',
          'Combinação: apenas I e IV.',
          'Marcar letra C.',
          'Em similares: diário acompanha o cuidado — não um único momento do plantão.',
        ],
        footer_rule: 'I + IV = corretas no gabarito',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DIÁRIO DO CUIDADOR',
        rows: [
          { label: 'Formato', value: 'Cronológico e legível', badge: 'hot' },
          { label: 'Registrar', value: 'Meds, SV, AVD, intercorrências', badge: 'hot' },
          { label: 'Quando', value: 'Durante o cuidado — não só abertura de turno', badge: 'warn' },
          { label: 'Função', value: 'Comunicar evolução à equipe', badge: 'ok' },
        ],
        footer_rule: 'MS Guia do Cuidador — registro contínuo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DIÁRIO',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Inclui item II sem IV completo.',
            correct: 'IV lista conteúdos obrigatórios do registro — falta em A.',
          },
          {
            label: 'Letra B — II e III',
            detail: 'Inclui registro só no início do plantão.',
            correct: 'III é falsa — registro deve ser ao longo do cuidado.',
          },
          {
            label: 'Letra D — III e IV',
            detail: 'Mantém erro do início do turno.',
            correct: 'III invalida a combinação — eliminar.',
          },
          {
            label: 'Letra C — I e IV',
            detail: 'Combinação correta do diário do cuidador.',
            correct: 'I (cronológico) e IV (conteúdos do registro) — gabarito.',
          },
          {
            label: 'Transferência — prontuário',
            detail: 'Diário domiciliar ≠ prontuário hospitalar.',
            correct: 'Questão é diário do cuidador familiar — I e IV.',
          },
        ],
        footer_rule: 'C = afirmativas I e IV corretas',
      },
    ],
  },

  'fundep-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-4': {
    family: 'certo_errado',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Prevenção de HAS — estilo de vida e atividade física (MS/DG-SA)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HAS — fatores de risco',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ações para quem não tem diagnóstico, mas tem fatores de risco — EXCETO.', icon: 'AlertTriangle' },
          { label: 'Alimentação', detail: 'Dieta saudável com baixo sal — orientação correta.', icon: 'Apple' },
          { label: 'Álcool', detail: 'Reduzir ou abandonar bebidas alcoólicas.', icon: 'Ban' },
          { label: 'Atividade física', detail: 'Prática regular protege — não orientar sedentarismo.', icon: 'Activity' },
          { label: 'PA', detail: 'Mensurar pressão arterial regularmente.', icon: 'Heart' },
        ],
        footer_rule: 'Promoção cardiovascular inclui movimento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ações do técnico para pessoas com fator de risco para HAS — EXCETO.',
          'A: hábitos alimentares saudáveis com baixo sal — correta.',
          'B: reduzir ou abandonar álcool — correta.',
          'D: mensurar PA regularmente — correta.',
          'C: orientar para NÃO realizar atividades físicas — INCORRETA (é a EXCETO).',
          'Atividade física regular é prevenção primária de HAS.',
          'Marcar letra C.',
          'Em similares: em EXCETO de prevenção, sedentarismo nunca é orientação.',
        ],
        footer_rule: 'EXCETO = conduta que não se faz',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PREVENÇÃO DE HAS',
        rows: [
          { label: 'Dieta', value: 'Baixo sal e alimentação saudável', badge: 'hot' },
          { label: 'Movimento', value: 'Atividade física regular', badge: 'hot' },
          { label: 'Álcool', value: 'Reduzir ou cessar', badge: 'ok' },
          { label: 'Monitorar', value: 'Medir PA periodicamente', badge: 'ok' },
        ],
        footer_rule: 'Nunca orientar contra exercício',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO HAS',
        items: [
          {
            label: 'Letra A — dieta',
            detail: 'Baixo teor de sal.',
            correct: 'Conduta correta — não é a EXCETO.',
          },
          {
            label: 'Letra B — álcool',
            detail: 'Reduzir ou abandonar bebidas.',
            correct: 'Prevenção de HAS — alternativa correta.',
          },
          {
            label: 'Letra D — PA',
            detail: 'Mensurar pressão arterial.',
            correct: 'Rastreamento adequado — não marque em EXCETO.',
          },
          {
            label: 'Letra C — sedentarismo',
            detail: 'Orientar para não realizar atividades físicas.',
            correct: 'É a EXCETO — atividade física protege contra HAS.',
          },
          {
            label: 'Transferência — medicamento',
            detail: 'Anti-hipertensivo sem diagnóstico.',
            correct: 'A armadilha é sedentarismo — letra C.',
          },
        ],
        footer_rule: 'C = não realizar atividades físicas',
      },
    ],
  },

  'fundepes-copeve-ufal-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-5': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'História natural da doença — fases evolutivas (epidemiologia MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'História natural da doença',
        meta: slideMeta,
        items: [
          { label: 'Processo', detail: 'Saúde e doença em curso evolutivo — limites nem sempre nítidos.', icon: 'GitBranch' },
          { label: 'Fase inicial', detail: 'Doença não evidente, mas já há alterações patológicas.', icon: 'Search' },
          { label: 'Fase clínica', detail: 'Manifestação com sintomas — item da prova com pegadinha de combinação.', icon: 'Stethoscope' },
          { label: 'Sequelas', detail: 'Incapacidade residual e limitação funcional.', icon: 'Accessibility' },
          { label: 'Pegadinha I', detail: '“Ainda não há doença” na fase patológica pré-clínica — confunde fases.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Gabarito da prova: II e IV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativas sobre fases da história natural — quais estão corretas.',
          'I: nega doença na fase patológica pré-clínica — INCORRETA (já há processo patológico).',
          'II: doença não evidente, mas alterações patológicas — CORRETA.',
          'III: fase clínica com sintomas — na chave desta prova não compõe o par correto.',
          'IV: incapacidade residual e sequelas — CORRETA.',
          'Combinação pedida: II e IV.',
          'Marcar letra C.',
          'Em similares: leia I — confundir ausência de doença com fase pré-clínica.',
        ],
        footer_rule: 'II + IV na sequência evolutiva',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FASES — HISTÓRIA NATURAL',
        rows: [
          { label: 'II', value: 'Patologia subclínica', badge: 'hot' },
          { label: 'IV', value: 'Sequelas e limitação funcional', badge: 'hot' },
          { label: 'Cuidado I', value: 'Não confundir com pré-patogênese', badge: 'warn' },
          { label: 'Clínica', value: 'Manifestação — atenção à combinação da banca', badge: 'info' },
        ],
        footer_rule: 'Evolução entre saúde e doença',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FASES',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Mantém afirmativa I incorreta.',
            correct: 'I erra ao negar doença na fase patológica.',
          },
          {
            label: 'Letra B — I e III',
            detail: 'Inclui item I falso.',
            correct: 'Pré-clínica já é processo patológico — eliminar.',
          },
          {
            label: 'Letra D — I, II e IV',
            detail: 'Inclui I na combinação.',
            correct: 'I é a principal armadilha — não entra.',
          },
          {
            label: 'Letra E — II, III e IV',
            detail: 'Parece epidemiologia clássica, mas chave é outra.',
            correct: 'Gabarito oficial: apenas II e IV — letra C.',
          },
          {
            label: 'Transferência — Leavell',
            detail: 'Níveis de prevenção ≠ fases da história natural.',
            correct: 'Questão cobra fases evolutivas da doença.',
          },
        ],
        footer_rule: 'C = afirmativas II e IV',
      },
    ],
  },

  'fundepes-copeve-ufal-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563950884-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Promoção da saúde — determinantes, meio ambiente e habitação (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Promoção da saúde',
        meta: slideMeta,
        items: [
          { label: 'Perspectiva', detail: 'Ações sobre determinantes — não só cura individual.', icon: 'Globe' },
          { label: 'Meio ambiente', detail: 'Combater degradação de recursos naturais.', icon: 'Leaf' },
          { label: 'Habitação', detail: 'Moradia e assentamentos rurais — promoção coletiva.', icon: 'Home' },
          { label: 'Equidade', detail: 'Reduzir fosso sanitário — não ampliá-lo.', icon: 'Scale' },
          { label: 'Pegadinha “sem envolver”', detail: 'Promoção exige participação comunitária.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Promoção atua nos determinantes sociais',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: possibilidade de atuação na promoção da saúde.',
          'Eliminar A — ações sem influência dos grupos sociais: promoção é política e participativa.',
          'Eliminar B — aumentar fosso de condições de saúde: oposto da equidade.',
          'Eliminar D — educação sem envolver-se no campo social: promoção é territorial.',
          'Eliminar E — empoderar sem reorientar recursos: integralidade exige gestão participativa.',
          'Manter C — agir contra degradação ambiental, habitação e assentamentos rurais.',
          'Marcar letra C.',
          'Em similares: promoção ≠ assistência clínica isolada.',
        ],
        footer_rule: 'Determinantes ambientais e habitacionais',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROMOÇÃO — EIXOS',
        rows: [
          { label: 'Ambiente', value: 'Proteger recursos naturais', badge: 'hot' },
          { label: 'Habitação', value: 'Moradia e assentamentos', badge: 'hot' },
          { label: 'Participação', value: 'Comunidade e grupos sociais', badge: 'ok' },
          { label: 'Erro', value: 'Ampliar desigualdade ou agir sem diálogo', badge: 'warn' },
        ],
        footer_rule: 'Carta de Ottawa — promoção ampliada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROMOÇÃO',
        items: [
          {
            label: 'Letra A — sem grupos sociais',
            detail: 'Ignora determinantes sociais.',
            correct: 'Promoção é ação política e coletiva — eliminar.',
          },
          {
            label: 'Letra B — aumentar fosso',
            detail: 'Aprofunda desigualdade em saúde.',
            correct: 'Contradiz equidade — não é promoção.',
          },
          {
            label: 'Letra D — educação isolada',
            detail: 'Sem atuar no campo social.',
            correct: 'Promoção articula educação e território.',
          },
          {
            label: 'Letra E — sem reorientar recursos',
            detail: 'Empoderar sem mudar gestão.',
            correct: 'Promoção envolve políticas e recursos — C é a correta.',
          },
          {
            label: 'Transferência — prevenção clínica',
            detail: 'Rastreamento individual isolado.',
            correct: 'Questão pede ação de promoção ampliada — ambiente/habitação.',
          },
        ],
        footer_rule: 'C = meio ambiente e habitação',
      },
    ],
  },

  'furb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-0': {
    family: 'conceito',
    branch: 'promocao_principios_direitos',
    guideline: 'Acolhimento na APS — vínculo, confiança e necessidades legítimas (MS)',
    sources: [LEI_8080_SOURCE, MS_PROMOCAO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Acolhimento na APS',
        meta: slideMeta,
        items: [
          { label: 'Definição', detail: 'Reconhecer necessidades de saúde como legítimas e singulares.', icon: 'Heart' },
          { label: 'Vínculo', detail: 'Confiança, compromisso e colaboração entre equipe e usuário.', icon: 'Handshake' },
          { label: 'Coletivo', detail: 'Construir vínculos entre equipes, serviços e usuários.', icon: 'Users' },
          { label: 'Clínica ampliada', detail: 'Olhar subjetivo e contexto — conceito próximo, não idêntico.', icon: 'Eye' },
          { label: 'Pegadinha gestão', detail: 'Planejamento ou gestão participativa ≠ acolhimento no ato do cuidado.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Acolhimento = porta de entrada humanizada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: reconhecer necessidades legítimas e construir vínculo de confiança.',
          'Eliminar A — clínica ampliada: relacionado, mas foco é método clínico ampliado.',
          'Eliminar B — planejamento de serviços: gestão, não conceito de acolhimento.',
          'Eliminar C — gestão participativa: participação social, não definição literal.',
          'Eliminar E — defesa de direitos: advocacy — distinto do acolhimento.',
          'Manter D — acolhimento.',
          'Marcar letra D.',
          'Em similares: acolhimento = escuta qualificada + legitimar demanda.',
        ],
        footer_rule: 'NHS e ESF: acolhimento como valor',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACOLHIMENTO',
        rows: [
          { label: 'Núcleo', value: 'Necessidade legítima e singular', badge: 'hot' },
          { label: 'Relação', value: 'Confiança e colaboração', badge: 'hot' },
          { label: 'Lugar', value: 'Porta de entrada da APS', badge: 'ok' },
          { label: '≠', value: 'Só gestão ou só clínica ampliada', badge: 'warn' },
        ],
        footer_rule: 'Humanização do cuidado primário',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ACOLHIMENTO',
        items: [
          {
            label: 'Letra A — clínica ampliada',
            detail: 'Método clínico com dimensão subjetiva.',
            correct: 'Conceito vizinho — não é a definição pedida.',
          },
          {
            label: 'Letra B — planejamento',
            detail: 'Organização de serviços.',
            correct: 'Gestão programática — não acolhimento.',
          },
          {
            label: 'Letra C — gestão participativa',
            detail: 'Controle social e participação.',
            correct: 'Política de gestão — distinto do vínculo no cuidado.',
          },
          {
            label: 'Letra E — defesa de direitos',
            detail: 'Garantir direitos do usuário.',
            correct: 'É papel do SUS, mas não define acolhimento.',
          },
          {
            label: 'Transferência — triagem',
            detail: 'Classificar risco na entrada.',
            correct: 'Acolhimento inclui escuta — letra D.',
          },
        ],
        footer_rule: 'D = acolhimento',
      },
    ],
  },

  'furb-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563914208-5': {
    family: 'vf',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Processo saúde-doença e história natural — pré-patogênese e patogênese (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Processo saúde-doença — I a III',
        meta: slideMeta,
        items: [
          { label: 'I — variáveis', detail: 'Processo saúde-doença abrange variáveis do indivíduo e população.', icon: 'Layers' },
          { label: 'II — pré-patogênese', detail: 'História natural: período antes do adoecimento.', icon: 'Shield' },
          { label: 'III — patogênico', detail: 'Após pré-patológico — contaminação e doença instalada.', icon: 'Activity' },
          { label: 'Sequência V-F', detail: 'As três afirmativas são verdadeiras — V-V-V.', icon: 'CheckCircle' },
          { label: 'Pegadinha', detail: 'Não confundir pré-patogênese com fase pré-clínica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'I, II e III = verdadeiras na prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: V ou F nas afirmativas I, II e III sobre processo saúde-doença.',
          'I: expressão refere-se a variáveis de saúde e doença — VERDADEIRA.',
          'II: história natural com pré-patogênese antes do adoecimento — VERDADEIRA.',
          'III: período patológico após o pré-patológico, com doença instalada — VERDADEIRA.',
          'Sequência correta: V - V - V.',
          'Marcar letra B.',
          'Em similares: rotule I–III ao eliminar cada assertiva.',
        ],
        footer_rule: 'Todas as assertivas corretas nesta questão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SAÚDE-DOENÇA',
        rows: [
          { label: 'I', value: 'Variáveis de saúde e doença', badge: 'hot' },
          { label: 'II', value: 'Pré-patogênese antes do adoecer', badge: 'hot' },
          { label: 'III', value: 'Período patológico instalado', badge: 'ok' },
          { label: 'Sequência', value: 'Três assertivas verdadeiras', badge: 'info' },
        ],
        footer_rule: 'Base da epidemiologia e prevenção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V-F',
        items: [
          {
            label: 'Letra A — V-F-F',
            detail: 'Nega períodos da história natural.',
            correct: '2ª e 3ª afirmativas são verdadeiras — eliminar.',
          },
          {
            label: 'Letra C — F-V-F',
            detail: 'Nega definição ampla do processo.',
            correct: '1ª afirmativa é verdadeira — eliminar.',
          },
          {
            label: 'Letra D — F-V-V',
            detail: 'Só primeira falsa.',
            correct: 'Processo saúde-doença cobre todas as variáveis — V na 1ª.',
          },
          {
            label: 'Letra E — V-F-V',
            detail: 'Nega pré-patogênese sequenciada.',
            correct: 'Modelo clássico confirma V-V-V.',
          },
          {
            label: 'Transferência — Leavell',
            detail: 'Prevenção primária atua na pré-patogênese.',
            correct: 'Sequência pedida: todas verdadeiras — B.',
          },
        ],
        footer_rule: 'B = V - V - V',
      },
    ],
  },

  'gama-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563909811-3': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Níveis de prevenção Leavell — primária, secundária e terciária (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Níveis de prevenção',
        meta: slideMeta,
        items: [
          { label: 'Fatores fisiológicos', detail: 'Sobrepeso estressa sistemas — suscetibilidade.', icon: 'Scale' },
          { label: 'Primária', detail: 'Antes da doença — prevenção verdadeira.', icon: 'Shield' },
          { label: 'Secundária', detail: 'Rastreamento e tratamento precoce — limitar incapacidade.', icon: 'Search' },
          { label: 'Terciária', detail: 'Reduzir complicações em doença instalada.', icon: 'Heart' },
          { label: 'Pegadinha primária', detail: 'Alternativa A troca secundária por primária.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Secundária = detectar e tratar cedo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre prevenção e fatores de risco.',
          'Eliminar A — chama secundária de “prevenção verdadeira” antes da doença: é definição de primária.',
          'Manter B — secundária inclui triagem e tratamento inicial para limitar incapacidade.',
          'Eliminar C — idade desassociada de outros fatores: idade interage com família e hábitos.',
          'Eliminar D — terciária focada em complicações: redação incompleta e confusa.',
          'Marcar letra B.',
          'Em similares: secundária = rastrear e intervir cedo.',
        ],
        footer_rule: 'B = prevenção secundária bem definida',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'LEAVELL — DECORE',
        rows: [
          { label: 'Primária', value: 'Evitar adoecer', badge: 'hot' },
          { label: 'Secundária', value: 'Triagem e tratamento precoce', badge: 'hot' },
          { label: 'Terciária', value: 'Limitar sequelas', badge: 'ok' },
          { label: 'Erro A', value: 'Trocar secundária por primária', badge: 'warn' },
        ],
        footer_rule: 'Fatores de risco orientam nível de prevenção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÍVEIS',
        items: [
          {
            label: 'Letra A — primária disfarçada',
            detail: 'Atribui à secundária o papel da primária.',
            correct: 'Prevenção verdadeira antes da doença é primária — não secundária.',
          },
          {
            label: 'Letra C — idade isolada',
            detail: 'Idade pouco associada a outros fatores.',
            correct: 'Fatores de risco são multifatoriais — eliminar.',
          },
          {
            label: 'Letra D — terciária',
            detail: 'Foco vago em complicações.',
            correct: 'Terciária limita incapacidade — redação da letra é armadilha.',
          },
          {
            label: 'Transferência — quaternária',
            detail: 'Evitar iatrogenia em outras provas.',
            correct: 'Aqui o gabarito é secundária — letra B.',
          },
        ],
        footer_rule: 'B = secundária com triagem',
      },
    ],
  },

  'gama-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Promoção × prevenção × proteção — oficinas e estilo de vida (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Promoção na comunidade',
        meta: slideMeta,
        items: [
          { label: 'Abordagem integrada', detail: 'Promoção, prevenção e proteção na saúde comunitária.', icon: 'Users' },
          { label: 'Promoção', detail: 'Melhorar bem-estar e reduzir riscos — alimentação e vida ativa.', icon: 'Activity' },
          { label: 'Prevenção primária', detail: 'Vacinação evita doença.', icon: 'Syringe' },
          { label: 'Prevenção secundária', detail: 'Rastreamento de câncer — detectar precoce.', icon: 'Search' },
          { label: 'Pegadinha nível', detail: 'Confundir promoção com rastreamento ou tratamento.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Promoção = capacitar para vida saudável',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ação mais adequada para promoção da saúde na comunidade.',
          'Eliminar A — rastreamento de câncer: prevenção secundária, não promoção ampla.',
          'Eliminar B — tratamento de crônicos: assistência curativa/terciária.',
          'Eliminar C — campanha de vacinação: prevenção primária específica.',
          'Manter D — oficinas de alimentação saudável e vida ativa para bem-estar geral.',
          'Marcar letra D.',
          'Em similares: promoção foca determinantes e hábitos — não só rastrear ou vacinar.',
        ],
        footer_rule: 'Oficinas educativas = promoção comunitária',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PROMOÇÃO × PREVENÇÃO',
        rows: [
          { label: 'Promoção', value: 'Estilo de vida e bem-estar', badge: 'hot' },
          { label: 'Primária', value: 'Vacina, saneamento', badge: 'ok' },
          { label: 'Secundária', value: 'Rastreamento', badge: 'ok' },
          { label: 'Terciária', value: 'Tratar crônicos', badge: 'info' },
        ],
        footer_rule: 'Integrar ações no território',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROMOÇÃO COMUNITÁRIA',
        items: [
          {
            label: 'Letra A — rastreamento',
            detail: 'Detectar câncer precocemente.',
            correct: 'É secundária — não a melhor resposta de promoção.',
          },
          {
            label: 'Letra B — tratamento',
            detail: 'Tratar condições crônicas.',
            correct: 'Cuidado clínico — não promoção comunitária.',
          },
          {
            label: 'Letra C — vacinação',
            detail: 'Prevenir infecções.',
            correct: 'Prevenção primária — importante, mas não é promoção ampla pedida.',
          },
          {
            label: 'Transferência — palestra única',
            detail: 'Evento isolado sem oficina.',
            correct: 'Oficinas participativas de alimentação e vida ativa — D.',
          },
        ],
        footer_rule: 'D = oficinas de alimentação e vida ativa',
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
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:promocao-g06] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g06] total=${ok}`);
}

main();
