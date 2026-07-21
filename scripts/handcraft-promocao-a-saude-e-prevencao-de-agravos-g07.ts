#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g07 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g07
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g07';
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
    'participação comunitária',
    'interdisciplinaridade',
    'comunicação em saúde',
    'determinantes sociais',
    'saneamento básico',
    'estilo de vida',
    'educação em saúde',
    'fatores de risco para diabetes',
  ],
};

const LEI_8080_SOURCE = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 8.080/1990 — Lei Orgânica da Saúde',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
  covers: ['participação da comunidade', 'integralidade', 'determinantes sociais'],
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
    .replace(/\bindice deincidência\b/gi, 'índice de incidência')
    .replace(/\bconsideraros\b/gi, 'considerar os')
    .replace(/\bcomoos\b/gi, 'como os')
    .replace(/\bnãotransmissíveis\b/gi, 'não transmissíveis')
    .replace(/\bconsequêncianegativa\b/gi, 'consequência negativa')
    .replace(/\banalise asafirmativas\b/gi, 'analise as afirmativas')
    .replace(/\bautonomiados\b/gi, 'autonomia dos')
    .replace(/\bdacorresponsabilidade\b/gi, 'da corresponsabilidade')
    .replace(/\bdeterminantessociais\b/gi, 'determinantes sociais')
    .replace(/\beconhecimentos\b/gi, 'e conhecimentos')
    .replace(/\bnoâmbito\b/gi, 'no âmbito')
    .replace(/\bejalmoço\b/gi, 'e jantar')
    .replace(/\bopeso\b/gi, 'o peso')
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
  'gama-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563941226-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Carta de Ottawa — ação comunitária e empoderamento (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Participação comunitária',
        meta: slideMeta,
        items: [
          { label: 'ACS na reunião', detail: 'Incentivar moradores a organizar ações de promoção.', icon: 'Users' },
          { label: 'Empoderamento', detail: 'Comunidade protagonista — não só receptor de serviços.', icon: 'Heart' },
          { label: 'Autonomia', detail: 'Capacidade de decidir e agir sobre a própria saúde.', icon: 'Shield' },
          { label: 'Benefício central', detail: 'Fortalecer autonomia e empoderamento — não só custo ou visibilidade.', icon: 'Target' },
          { label: 'Pegadinha', detail: 'Confundir adesão aos serviços com protagonismo comunitário.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Participação = autonomia e empoderamento',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principal benefício da participação comunitária nas ações de promoção.',
          'Eliminar A — redução de custos: efeito indireto, não o benefício principal pedido.',
          'Eliminar B — visibilidade da equipe: foco no profissional, não no empoderamento.',
          'Eliminar D — adesão aos serviços: importante, mas secundário à autonomia comunitária.',
          'Manter C — fortalecimento da autonomia e empoderamento da comunidade.',
          'Marcar letra C.',
          'Em similares: Ottawa valoriza ação comunitária e capacitação — não métrica administrativa.',
        ],
        footer_rule: 'Protagonismo comunitário = C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CARTA DE OTTAWA',
        rows: [
          { label: 'Ação comunitária', value: 'Mobilizar e capacitar moradores', badge: 'hot' },
          { label: 'Empoderamento', value: 'Controle sobre saúde e vida', badge: 'hot' },
          { label: 'Não confundir', value: 'Custo, marketing ou adesão passiva', badge: 'warn' },
          { label: 'Papel do ACS', value: 'Facilitar — não substituir a comunidade', badge: 'ok' },
        ],
        footer_rule: 'Promoção = processo comunitário',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PARTICIPAÇÃO',
        items: [
          {
            label: 'Letra A — custos',
            detail: 'Reduzir gastos dos programas.',
            correct: 'Efeito possível, mas não o principal benefício da participação.',
          },
          {
            label: 'Letra B — visibilidade',
            detail: 'Destacar o trabalho da equipe.',
            correct: 'Foco institucional — não empoderamento comunitário.',
          },
          {
            label: 'Letra D — adesão',
            detail: 'Maior uso dos serviços oferecidos.',
            correct: 'Adesão ≠ autonomia — C é o núcleo da promoção.',
          },
          {
            label: 'Transferência — fiscalização',
            detail: 'Comunidade fiscalizando unidade.',
            correct: 'Participação na organização de promoção — autonomia e empoderamento (C).',
          },
        ],
        footer_rule: 'C = autonomia e empoderamento',
      },
    ],
  },

  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Intersetorialidade e determinantes sociais — PNPS/MS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Interdisciplinaridade',
        meta: slideMeta,
        items: [
          { label: 'Promoção ampla', detail: 'Saúde, educação, assistência social e outras políticas.', icon: 'Network' },
          { label: 'Determinantes', detail: 'Condições de vida, renda, moradia, cultura.', icon: 'Home' },
          { label: 'Colaboração', detail: 'Setores articulados — não só biomedicina.', icon: 'Users' },
          { label: 'Participação', detail: 'Comunidade no planejamento das ações.', icon: 'Megaphone' },
          { label: 'Pegadinha', detail: '“Unidisciplinar é melhor” ou “interdisciplinar é ultrapassada”.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Promoção exige intersetorialidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa CORRETA sobre estratégias interdisciplinares.',
          'Eliminar A — unidisciplinar mais eficaz: contrário à promoção e ao SUS.',
          'Eliminar B e E — negam aspectos sociais e participação: falsas por exclusão.',
          'Eliminar D — interdisciplinaridade ultrapassada: inverdade na APS.',
          'Manter C — colaboração entre saúde, educação, assistência social e demais setores.',
          'Marcar letra C.',
          'Em similares: promoção = políticas intersetoriais + participação social.',
        ],
        footer_rule: 'Articulação entre setores = C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'INTERSETORIALIDADE',
        rows: [
          { label: 'Setores', value: 'Saúde · Educação · Assistência social', badge: 'hot' },
          { label: 'Objeto', value: 'Determinantes e condições de vida', badge: 'hot' },
          { label: 'Comunidade', value: 'Participação no planejamento', badge: 'ok' },
          { label: 'Erro clássico', value: 'Isolar ação na enfermagem/clínica', badge: 'warn' },
        ],
        footer_rule: 'Nenhum setor resolve sozinho',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERDISCIPLINAR',
        items: [
          {
            label: 'Letra A — unidisciplinar',
            detail: 'Abordagem unidisciplinar mais eficaz.',
            correct: 'Promoção exige articulação — A é falsa.',
          },
          {
            label: 'Letra B — ignora social',
            detail: 'Não considera aspectos sociais.',
            correct: 'Determinantes sociais são centrais — eliminar.',
          },
          {
            label: 'Letra D — ultrapassada',
            detail: 'Interdisciplinaridade dificulta eficiência.',
            correct: 'É diretriz do SUS e da promoção — falsa.',
          },
          {
            label: 'Letra E — sem participação',
            detail: 'Não considera participação comunitária.',
            correct: 'Participação é pilar — eliminar.',
          },
          {
            label: 'Letra C — colaboração',
            detail: 'Saúde, educação e assistência social integradas.',
            correct: 'Síntese correta da intersetorialidade — gabarito.',
          },
          {
            label: 'Transferência — só hospital',
            detail: 'Promoção restrita à unidade de saúde.',
            correct: 'Intersetorialidade articula políticas — colaboração entre setores (C).',
          },
        ],
        footer_rule: 'C = colaboração entre setores',
      },
    ],
  },

  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-1': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Comunicação em saúde — adaptação cultural (MS/PN DST)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Comunicação em DST',
        meta: slideMeta,
        items: [
          { label: 'Cenário', detail: 'Campanha de DST em comunidade com alta incidência.', icon: 'MapPin' },
          { label: 'Linguagem acessível', detail: 'Evitar jargão que afasta o público.', icon: 'MessageCircle' },
          { label: 'Cultura local', detail: 'Adaptar mensagens a valores e língua do território.', icon: 'Globe' },
          { label: 'Sem medo moral', detail: 'Estigma e terror reduzem adesão — não educam.', icon: 'Ban' },
          { label: 'Público amplo', detail: 'Jovens e adultos — não restringir informação.', icon: 'Users' },
        ],
        footer_rule: 'Comunicar com respeito cultural',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa CORRETA sobre comunicação na campanha de DST.',
          'Eliminar A — linguagem técnica privilegiada: afasta a comunidade.',
          'Eliminar B — enfatizar medo e consequências graves: abordagem estigmatizante.',
          'Eliminar D — informação só para adultos: exclui adolescentes em risco.',
          'Eliminar E — divulgação só por profissionais de saúde: limita alcance comunitário.',
          'Manter C — adaptar mensagens às características culturais e linguísticas locais.',
          'Marcar letra C.',
          'Em similares: promoção comunica com o território — não contra ele.',
        ],
        footer_rule: 'Adaptação cultural = C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMUNICAÇÃO EM SAÚDE',
        rows: [
          { label: 'Linguagem', value: 'Clara e contextualizada', badge: 'hot' },
          { label: 'Cultura', value: 'Respeitar valores locais', badge: 'hot' },
          { label: 'Evitar', value: 'Medo, jargão, exclusão de públicos', badge: 'warn' },
          { label: 'Rede', value: 'ACS, escola, lideranças — não só médico', badge: 'ok' },
        ],
        footer_rule: 'Mensagem certa para quem ouve',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMUNICAÇÃO DST',
        items: [
          {
            label: 'Letra A — técnica',
            detail: 'Privilegiar linguagem científica.',
            correct: 'Jargão reduz compreensão na comunidade.',
          },
          {
            label: 'Letra B — medo',
            detail: 'Enfatizar consequências graves.',
            correct: 'Abordagem por medo estigmatiza — incorreta.',
          },
          {
            label: 'Letra D — só adultos',
            detail: 'Restringir informação a adultos.',
            correct: 'Adolescentes também precisam de prevenção.',
          },
          {
            label: 'Letra E — só profissionais',
            detail: 'Divulgação exclusiva da equipe de saúde.',
            correct: 'Ação comunitária amplia alcance — eliminar.',
          },
          {
            label: 'Letra C — adaptação',
            detail: 'Mensagens conforme cultura e linguagem local.',
            correct: 'Princípio da comunicação em promoção — gabarito.',
          },
          {
            label: 'Transferência — panfleto genérico',
            detail: 'Mesmo folder para qualquer bairro.',
            correct: 'Adaptar à cultura local — mensagem eficaz em DST (C).',
          },
        ],
        footer_rule: 'C = adaptação cultural e linguística',
      },
    ],
  },

  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-2': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Determinantes de DCNT — alimentação e vulnerabilidade (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Risco em DCNT',
        meta: slideMeta,
        items: [
          { label: 'Levantamento ACS', detail: 'Área urbana com alta incidência de crônicas.', icon: 'ClipboardList' },
          { label: 'Dieta ultraprocessada', detail: 'Alimentos processados em excesso — fator de risco.', icon: 'Utensils' },
          { label: 'Atividade física', detail: 'Prática regular protege — não causa doença.', icon: 'Activity' },
          { label: 'Poluição', detail: 'Exposição ambiental impacta saúde.', icon: 'Wind' },
          { label: 'Acesso à saúde', detail: 'Falta de acesso é vulnerabilidade — não “ilimitado”.', icon: 'Hospital' },
        ],
        footer_rule: 'Dieta inadequada aumenta risco de DCNT',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre risco/vulnerabilidade na comunidade.',
          'Manter A — dieta inadequada aumenta risco de doenças crônicas não transmissíveis.',
          'Eliminar B — atividade física regular: fator protetor, não causador.',
          'Eliminar C — poluentes não influenciam: falso — ambiente importa.',
          'Eliminar D — acesso ilimitado como vulnerabilidade: inverte a lógica.',
          'Eliminar E — falta de educação impacta positivamente: absurdo pedagógico.',
          'Marcar letra A.',
          'Em similares: alimentação ultraprocessada = determinante de DCNT.',
        ],
        footer_rule: 'Ultraprocessados = risco — A',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DETERMINANTES DCNT',
        rows: [
          { label: 'Alimentação', value: 'Ultraprocessados ↑ risco', badge: 'hot' },
          { label: 'Proteção', value: 'Atividade física regular', badge: 'ok' },
          { label: 'Ambiente', value: 'Poluição e saneamento', badge: 'info' },
          { label: 'Vulnerabilidade', value: 'Baixo acesso e baixa escolaridade', badge: 'warn' },
        ],
        footer_rule: 'Território revela determinantes',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VULNERABILIDADE',
        items: [
          {
            label: 'Letra B — atividade física',
            detail: 'Exercício ligado ao aparecimento de doença.',
            correct: 'Atividade física é protetora — afirmativa invertida.',
          },
          {
            label: 'Letra C — poluição',
            detail: 'Poluentes não influenciam saúde.',
            correct: 'Determinante ambiental relevante — falsa.',
          },
          {
            label: 'Letra D — acesso ilimitado',
            detail: 'Acesso ilimitado como vulnerabilidade.',
            correct: 'Vulnerabilidade é falta de acesso — inversão.',
          },
          {
            label: 'Letra E — educação',
            detail: 'Falta de educação impacta positivamente escolhas.',
            correct: 'Educação favorece escolhas saudáveis — eliminar.',
          },
          {
            label: 'Letra A — dieta',
            detail: 'Dieta inadequada e DCNT.',
            correct: 'Coerente com o observado nas visitas — gabarito.',
          },
          {
            label: 'Transferência — genética só',
            detail: 'Risco explicado apenas por herança.',
            correct: 'Determinantes comportamentais e ambientais — dieta inadequada (A).',
          },
        ],
        footer_rule: 'A = dieta inadequada e DCNT',
      },
    ],
  },

  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563932216-0': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Saneamento básico e saúde pública — MS/OMS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Saneamento e saúde',
        meta: slideMeta,
        items: [
          { label: 'Água potável', detail: 'Acesso seguro reduz doenças hidricamente relacionadas.', icon: 'Droplets' },
          { label: 'Esgotamento', detail: 'Coleta e tratamento evitam contaminação ambiental.', icon: 'Recycle' },
          { label: 'Doenças diarreicas', detail: 'Diarréia e desnutrição — especialmente em crianças.', icon: 'Baby' },
          { label: 'Mortalidade infantil', detail: 'Indicador sensível à falta de saneamento.', icon: 'TrendingDown' },
          { label: 'Pegadinha', detail: 'Inverter efeito — “melhora da qualidade de vida” sem água.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Sem saneamento ↑ doença e mortalidade infantil',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: consequência negativa da falta de água potável e saneamento.',
          'Eliminar A — menos doenças respiratórias por ausência de água: incoerente.',
          'Eliminar B — redução de doenças transmitidas pela água: efeito oposto ao esperado.',
          'Eliminar C — aumento da expectativa de vida por exposição a microrganismos: absurdo.',
          'Eliminar E — melhoria da qualidade de vida por patógenos: inverso da realidade.',
          'Manter D — aumento da mortalidade infantil por desnutrição e diarréia.',
          'Marcar letra D.',
          'Em similares: saneamento = prevenção coletiva de agravos.',
        ],
        footer_rule: 'Falta de saneamento mata crianças — D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SANEAMENTO BÁSICO',
        rows: [
          { label: 'Componentes', value: 'Água · esgoto · resíduos', badge: 'hot' },
          { label: 'Sem acesso', value: 'Diarréia, desnutrição, morte infantil', badge: 'warn' },
          { label: 'Promoção', value: 'Política pública estruturante', badge: 'ok' },
          { label: 'Não confundir', value: 'Saneamento ≠ só hospital', badge: 'info' },
        ],
        footer_rule: 'Água e esgoto salvam vidas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SANEAMENTO',
        items: [
          {
            label: 'Letra A — respiratórias',
            detail: 'Diminuição de doenças respiratórias.',
            correct: 'Não é consequência lógica da falta de água.',
          },
          {
            label: 'Letra B — redução DTAs',
            detail: 'Menos diarréia e cólera.',
            correct: 'Sem saneamento a incidência aumenta — eliminar.',
          },
          {
            label: 'Letra C — expectativa de vida',
            detail: 'Aumento da expectativa por microrganismos.',
            correct: 'Exposição a patógenos reduz sobrevida — falsa.',
          },
          {
            label: 'Letra E — qualidade de vida',
            detail: 'Melhoria por exposição a agentes.',
            correct: 'Efeito é dano à saúde — eliminar.',
          },
          {
            label: 'Letra D — mortalidade infantil',
            detail: 'Desnutrição e diarréia relacionadas.',
            correct: 'Consequência clássica da falta de saneamento — gabarito.',
          },
          {
            label: 'Transferência — cloro doméstico',
            detail: 'Tratar água em casa dispensa esgoto.',
            correct: 'Saneamento integrado — falta de água e esgoto aumenta mortalidade infantil (D).',
          },
        ],
        footer_rule: 'D = mortalidade infantil e diarréia',
      },
    ],
  },

  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-2': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Dez passos para alimentação saudável — MS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Estilo de vida e DCNT',
        meta: slideMeta,
        items: [
          { label: 'Morbidade crônica', detail: 'Estilo de vida é determinante central.', icon: 'Activity' },
          { label: 'Antropometria', detail: 'Peso, altura e circunferências — base do estado nutricional.', icon: 'Ruler' },
          { label: 'Alimentação', detail: 'Modificação dietética controla risco cardiovascular.', icon: 'Apple' },
          { label: 'Dez passos MS', detail: 'Instrumento oficial de educação alimentar.', icon: 'ListOrdered' },
          { label: 'APS', detail: 'Orientação alimentar na atenção primária — não só especializada.', icon: 'Home' },
        ],
        footer_rule: 'Dez passos MS = referência alimentar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre estilo de vida e doenças crônicas.',
          'Eliminar A — antropometria não fundamental ao planejamento: subestima avaliação nutricional.',
          'Eliminar B — alimentação só para “controle proteico”: redutor; benefício é metabólico/cardiovascular.',
          'Eliminar C — alimentação saudável só na atenção especializada: erro de nível de atenção.',
          'Eliminar E — recomendação genérica de atividade sem base do enunciado: não é o foco da correta.',
          'Manter D — refeições e lanches do instrumento “Dez passos para uma alimentação saudável” do MS.',
          'Marcar letra D.',
          'Em similares: reconhecer conteúdo oficial do MS em promoção nutricional.',
        ],
        footer_rule: 'Dez passos MS citados em D',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DEZ PASSOS MS',
        rows: [
          { label: 'Instrumento', value: 'Dez passos — alimentação saudável', badge: 'hot' },
          { label: 'Hábitos', value: 'Refeições regulares e lanches saudáveis', badge: 'hot' },
          { label: 'Onde aplicar', value: 'APS e promoção — não só especializada', badge: 'warn' },
          { label: 'Antropometria', value: 'Fundamental no planejamento', badge: 'ok' },
        ],
        footer_rule: 'Educação alimentar na rede básica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESTILO DE VIDA',
        items: [
          {
            label: 'Letra A — antropometria',
            detail: 'Não fundamental ao planejamento.',
            correct: 'Avaliação antropométrica é base do cuidado nutricional.',
          },
          {
            label: 'Letra B — alimentação',
            detail: 'Recurso só para controle proteico.',
            correct: 'Reduz risco cardiovascular — formulação estreita demais.',
          },
          {
            label: 'Letra C — especializada',
            detail: 'Orientação só na atenção especializada.',
            correct: 'Promoção e prevenção na APS — eliminar.',
          },
          {
            label: 'Letra E — atividade genérica',
            detail: 'Frase motivacional sem vínculo com o instrumento MS.',
            correct: 'Não responde ao que a banca marca como correta.',
          },
          {
            label: 'Letra D — Dez passos',
            detail: 'Refeições e lanches do guia MS.',
            correct: 'Conteúdo oficial do instrumento — gabarito.',
          },
          {
            label: 'Transferência — dieta da moda',
            detail: 'Plano alimentar da internet sem referência MS.',
            correct: 'Instrumento oficial Dez passos — educação alimentar na APS (D).',
          },
        ],
        footer_rule: 'D = Dez passos do Ministério da Saúde',
      },
    ],
  },

  'ibam-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563863195-8': {
    family: 'vf',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Educação em saúde — diálogo e determinantes (PNPS/MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Educação em saúde',
        meta: slideMeta,
        items: [
          { label: 'I — Conteúdo técnico', detail: 'Pode ajudar se dialogar com vivências — não só palestra.', icon: 'BookOpen' },
          { label: 'II — Escuta e diálogo', detail: 'Problematiza condições de vida e corresponsabilidade.', icon: 'Ear' },
          { label: 'III — Lógica prescritiva', detail: 'Só “faça isso” não enfrenta determinantes sociais.', icon: 'Ban' },
          { label: 'IV — Território', detail: 'Saberes populares + técnicos na mediação educativa.', icon: 'Map' },
          { label: 'Pegadinha', detail: 'Achar que prevenção prescritiva basta para determinantes.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Educação ≠ transferência de receita',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sequência V/F das afirmativas I a IV sobre práticas educativas.',
          'I: exposição técnica dialogando com vivências pode favorecer mudanças — VERDADEIRA.',
          'II: escuta e diálogo fortalecem corresponsabilidade — VERDADEIRA.',
          'III: estratégias prescritivas respondem adequadamente aos determinantes sociais — FALSA.',
          'IV: metodologias com território e saberes populares — VERDADEIRA.',
          'Sequência: V, V, F, V.',
          'Marcar letra C.',
          'Em similares: promoção educa com diálogo — não só norma imposta.',
        ],
        footer_rule: 'V-V-F-V = letra C',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRÁTICAS EDUCATIVAS',
        rows: [
          { label: 'I', value: 'Técnica + vivência — pode ser V', badge: 'ok' },
          { label: 'II', value: 'Escuta e corresponsabilidade — V', badge: 'hot' },
          { label: 'III', value: 'Só prescrição — F (determinantes)', badge: 'warn' },
          { label: 'IV', value: 'Território e saberes — V', badge: 'hot' },
        ],
        footer_rule: 'III é a falsa do bloco',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F EDUCAÇÃO',
        items: [
          {
            label: 'Letra A — F,V,V,V',
            detail: 'Primeiro item falso.',
            correct: 'I é verdadeira na chave — eliminar.',
          },
          {
            label: 'Letra B — V,F,F,F',
            detail: 'Só o primeiro verdadeiro.',
            correct: 'II e IV são verdadeiras — eliminar.',
          },
          {
            label: 'Letra D — V,V,V,V',
            detail: 'Todos verdadeiros.',
            correct: 'III é falsa — prescrição não basta para determinantes.',
          },
          {
            label: 'Letra C — V,V,F,V',
            detail: 'Sequência da banca.',
            correct: 'I e II verdadeiras; III falsa; IV verdadeira — gabarito.',
          },
          {
            label: 'Transferência — palestra',
            detail: 'Educação = só slide informativo.',
            correct: 'Exige diálogo, território e corresponsabilidade — C.',
          },
        ],
        footer_rule: 'C = V, V, F, V',
      },
    ],
  },

  'ibfc-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-2': {
    family: 'vf',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Fatores de risco para diabetes — MS/DG-SA',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Risco de diabetes',
        meta: slideMeta,
        items: [
          { label: 'I — Peso e história familiar', detail: 'Obesidade + pai/mãe com diabetes = risco.', icon: 'Users' },
          { label: 'II — Peso e HAS', detail: 'Síndrome metabólica associada.', icon: 'HeartPulse' },
          { label: 'III — DM gestacional/RN grande', detail: 'Antecedente obstétrico de risco.', icon: 'Baby' },
          { label: 'IV — Atividade física', detail: 'Prática regular é protetora — não é fator de risco.', icon: 'Activity' },
          { label: 'V — SOP e excesso de peso', detail: 'Resistência insulínica frequente.', icon: 'AlertCircle' },
        ],
        footer_rule: 'Atividade física protege — item IV é F',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sequência V/F dos fatores de risco para diabetes.',
          'I: excesso de peso e história familiar — VERDADEIRO (fator de risco).',
          'II: excesso de peso e hipertensão — VERDADEIRO.',
          'III: excesso de peso e DM gestacional ou RN macrossômico — VERDADEIRO.',
          'IV: atividade física regular — FALSO (é fator protetor, não de risco).',
          'V: excesso de peso e síndrome dos ovários policísticos — VERDADEIRO.',
          'Sequência: V - V - V - F - V.',
          'Marcar letra A.',
          'Em similares: separar fator de risco de hábito protetor.',
        ],
        footer_rule: 'IV falso = atividade física protege',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'FATORES DE RISCO DM',
        rows: [
          { label: 'I', value: 'Obesidade + história familiar — V', badge: 'hot' },
          { label: 'II', value: 'Obesidade + HAS — V', badge: 'hot' },
          { label: 'III', value: 'DM gestacional / RN grande — V', badge: 'ok' },
          { label: 'IV', value: 'Atividade física regular — F', badge: 'warn' },
          { label: 'V', value: 'Obesidade + SOP — V', badge: 'ok' },
        ],
        footer_rule: 'Proteção ≠ risco no item IV',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RISCO DM',
        items: [
          {
            label: 'Letra B — V,V,F,F,F',
            detail: 'Marca III como falso.',
            correct: 'DM gestacional e RN grande são fatores de risco — III é V.',
          },
          {
            label: 'Letra C — todos V',
            detail: 'Quatro primeiros verdadeiros incluindo IV.',
            correct: 'Atividade física regular é protetora — IV é F.',
          },
          {
            label: 'Letra D — início F,F',
            detail: 'Nega história familiar e HAS.',
            correct: 'I e II são fatores clássicos — eliminar.',
          },
          {
            label: 'Letra E — V,V,V,F,F',
            detail: 'Marca V como falso.',
            correct: 'SOP com excesso de peso aumenta risco — V é verdadeiro.',
          },
          {
            label: 'Letra A — V,V,V,F,V',
            detail: 'Única sequência coerente.',
            correct: 'IV é o único falso — atividade física protege; demais são risco.',
          },
        ],
        footer_rule: 'A = V-V-V-F-V',
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
    console.log(`[handcraft:promocao-g07] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g07] total=${ok}`);
}

main();
