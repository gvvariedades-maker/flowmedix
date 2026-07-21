#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — promocao-a-saude-e-prevencao-de-agravos-g05 (8 slugs).
 *
 *   npm run handcraft:promocao-a-saude-e-prevencao-de-agravos-g05
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import { PROMOCAO_SAUDE_SUS } from '@/lib/guidelines/promocaoSaude';

const LOTE = 'promocao-a-saude-e-prevencao-de-agravos-g05';
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
    'atenção primária',
    'vigilância em saúde',
    'planejamento familiar',
  ],
};

const LEI_8080_SOURCE = {
  id: 'lei-8080-1990',
  tier: 'A' as const,
  issuer: 'Presidência da República',
  title: 'Lei nº 8.080/1990 — Lei Orgânica da Saúde',
  year: 1990,
  url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm',
  covers: ['atenção primária', 'integralidade', 'universalidade', 'hierarquização'],
};

const MS_TB_SOURCE = {
  id: 'ms-tb-sintomatico',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Manual de Recomendações para o Controle da Tuberculose no Brasil',
  year: 2019,
  covers: ['busca ativa', 'sintomático respiratório', 'tosse ≥ 3 semanas'],
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
  sources?: (typeof MS_PROMOCAO_SOURCE | typeof LEI_8080_SOURCE | typeof MS_TB_SOURCE)[];
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
    .replace(/\bahidratação\b/gi, 'hidratação')
    .replace(/\bdo Guia Prático doCuidador\b/gi, 'do Guia Prático do Cuidador')
    .replace(/\bcontaminaçãopor\b/gi, 'contaminação por')
    .replace(/\bdoençassexualmente\b/gi, 'doenças sexualmente')
    .replace(/\btossepor\b/gi, 'tosse por')
    .replace(/\bcomplicações\.Nesse\b/gi, 'complicações. Nesse')
    .replace(/\bsomente osgrupos\b/gi, 'somente os grupos')
    .replace(/\b487\d\)\s*/g, '')
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
  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563927625-6': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'DDA — hidratação oral e SRO; prevenção no território (MS/OMS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DDA e SRO',
        meta: slideMeta,
        items: [
          { label: 'Tratamento', detail: 'Hidratação oral com soro de reidratação oral (SRO).', icon: 'Droplet' },
          { label: 'Doença diarreica aguda', detail: 'Perda de líquidos e eletrólitos — prevenção no ACS.', icon: 'Activity' },
          { label: 'ACS', detail: 'Orientar SRO precoce e sinais de gravidade na comunidade.', icon: 'Home' },
          { label: 'Pegadinha dengue', detail: 'Dengue tem outro manejo — não é DDA com SRO isolado.', icon: 'AlertTriangle' },
          { label: 'Prevenção', detail: 'Saneamento e higiene — primária; SRO trata desidratação.', icon: 'Shield' },
        ],
        footer_rule: 'SRO = pilar do tratamento da diarreia aguda',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: doença cuja terapêutica é hidratação oral com SRO.',
          'Enunciado descreve reidratação oral — marca de doença diarreica aguda.',
          'Eliminar A — dengue: manejo clínico distinto, não só SRO como definição.',
          'Eliminar B — vômito agudo isolado: não é o conceito clássico de DDA.',
          'Eliminar D — pneumonia: acomete vias aéreas inferiores.',
          'Eliminar E — doença de Chagas: parasitose crônica.',
          'Manter C — doença diarreica aguda (DDA).',
          'Marcar letra C.',
          'Em similares: SRO na APS = diarreia aguda.',
        ],
        footer_rule: 'ACS previne desidratação orientando SRO',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DDA — DECORE',
        rows: [
          { label: 'Tratamento', value: 'SRO + alimentação + zinco (MS)', badge: 'hot' },
          { label: 'Sinal de alerta', value: 'Sede intensa, olhos fundos, letargia', badge: 'warn' },
          { label: 'Prevenção', value: 'Água tratada e higiene', badge: 'ok' },
          { label: 'Confundir', value: 'Dengue, pneumonia, Chagas', badge: 'info' },
        ],
        footer_rule: 'Promoção: orientar uso correto do SRO',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DDA × SRO',
        items: [
          {
            label: 'Letra A — dengue',
            detail: 'Dengue humana (DHA).',
            correct: 'Febre hemorrágica exige vigilância de sinais de alarme — não é DDA.',
          },
          {
            label: 'Letra B — vômito',
            detail: 'Vômito agudo isolado.',
            correct: 'Não define doença diarreica aguda com perda hídrica fecal.',
          },
          {
            label: 'Letra D — pneumonia',
            detail: 'Infecção respiratória.',
            correct: 'Tosse e dispneia — fora do quadro diarreico com SRO.',
          },
          {
            label: 'Letra E — Chagas',
            detail: 'Doença de Chagas.',
            correct: 'Tripanossomíase crônica — não tratada com SRO.',
          },
          {
            label: 'Transferência — soro EV',
            detail: 'Em gravidade, hidratação venosa pode ser necessária.',
            correct: 'A definição pedida é DDA — terapêutica base SRO.',
          },
        ],
        footer_rule: 'C = doença diarreica aguda com SRO',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563937068-4': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'ACS — grupos de risco no território (MS/ESF)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Grupos de risco — ACS',
        meta: slideMeta,
        items: [
          { label: 'Situação de risco', detail: 'Maior chance de adoecer — ACS prioriza acompanhamento.', icon: 'AlertTriangle' },
          { label: 'Crianças', detail: 'Baixo peso ao nascer e desnutrição (I).', icon: 'Baby' },
          { label: 'Gestação', detail: 'Tabaco, álcool, drogas; diabetes e HAS (II e IV).', icon: 'Heart' },
          { label: 'Não é risco', detail: 'Pré-natal regular sem fator (III); perfil sem fator (V).', icon: 'Ban' },
          { label: 'Vigilância', detail: 'Identificar vulnerabilidade na visita domiciliar.', icon: 'Eye' },
        ],
        footer_rule: 'Risco = vulnerabilidade biológica ou social',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: itens I–V — somente grupos de risco para o ACS.',
          'I: crianças de baixo peso ao nascer e desnutridas — RISCO.',
          'II: filhos de mães que fumam/bebem/usam drogas na gestação — RISCO.',
          'III: gestantes com pré-natal regular e sem risco — NÃO é grupo de risco.',
          'IV: gestantes fumantes com diabetes e/ou pressão alta — RISCO.',
          'V: sem sobrepeso, sedentários sem tabaco/álcool — NÃO é grupo de risco.',
          'Combinação correta: I, II e IV.',
          'Marcar letra C.',
          'Em similares: leia negações — III e V são armadilhas.',
        ],
        footer_rule: 'I + II + IV = grupos de risco',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'GRUPOS DE RISCO — ACS',
        rows: [
          { label: 'I', value: 'RN de baixo peso e criança desnutrida', badge: 'hot' },
          { label: 'II', value: 'Exposição materna a álcool/tabaco/drogas', badge: 'hot' },
          { label: 'IV', value: 'Gestante fumante + DM/ HAS', badge: 'hot' },
          { label: 'Excluir', value: 'III pré-natal ok · V sem fator', badge: 'warn' },
        ],
        footer_rule: 'Priorizar território vulnerável',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GRUPOS DE RISCO',
        items: [
          {
            label: 'Letra A — só I e II',
            detail: 'Omite gestante de alto risco metabólico.',
            correct: 'IV também é grupo de risco — eliminar.',
          },
          {
            label: 'Letra B — I e V',
            detail: 'Inclui perfil sem fator de risco (V).',
            correct: 'V descreve pessoas sem vulnerabilidade — não é risco.',
          },
          {
            label: 'Letra D — todos',
            detail: 'Inclui III e V que não são risco.',
            correct: 'III é gestação de baixo risco — não entra.',
          },
          {
            label: 'Letra E — III e V',
            detail: 'Só itens que negam risco.',
            correct: 'São justamente os que não devem ser priorizados como risco.',
          },
          {
            label: 'Transferência — idoso',
            detail: 'Em outra banca, idoso frágil entra como risco.',
            correct: 'Nesta questão: I, II e IV são os de risco.',
          },
        ],
        footer_rule: 'C = I, II e IV',
      },
    ],
  },

  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-9': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Planejamento familiar — preservativo de barreira e prevenção de IST (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preservativo de barreira',
        meta: slideMeta,
        items: [
          { label: 'Planejamento familiar', detail: 'Métodos contraceptivos e prevenção de agravos.', icon: 'Users' },
          { label: 'Barreira', detail: 'Preservativo masculino e feminino — método de barreira.', icon: 'Shield' },
          { label: 'IST', detail: 'Único método contraceptivo que reduz transmissão de IST.', icon: 'Ban' },
          { label: 'Dupla proteção', detail: 'Previne gravidez e IST quando usado corretamente.', icon: 'CheckCircle' },
          { label: 'Pegadinha hormonal', detail: 'Pílula e injetável não previnem IST.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Barreira = preservativo na educação em saúde',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: método contraceptivo — figura preservativo de barreira.',
          'Eliminar A — laqueadura/vasectomia: cirurgia estéril, não preservativo.',
          'Eliminar B — pílula hormonal: não previne IST.',
          'Eliminar C — injetável hormonal: não previne IST.',
          'Eliminar D — gel espermicida: barreira parcial, não é preservativo.',
          'Manter E — preservativo masculino e feminino — barreira contra IST e gravidez.',
          'Marcar letra E.',
          'Em similares: único contraceptivo que previne IST = preservativo.',
        ],
        footer_rule: 'Educação do ACS inclui uso correto do preservativo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRESERVATIVO — DECORE',
        rows: [
          { label: 'Tipo', value: 'Método de barreira', badge: 'hot' },
          { label: 'IST', value: 'Reduz transmissão — único entre contraceptivos', badge: 'hot' },
          { label: 'Gravidez', value: 'Previne se uso correto', badge: 'ok' },
          { label: 'Erro', value: 'Confundir com hormonal ou cirurgia', badge: 'warn' },
        ],
        footer_rule: 'Promoção: prevenção combinada IST + gravidez',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONTRACEPTIVOS',
        items: [
          {
            label: 'Letra A — laqueadura',
            detail: 'Cirurgia estéril rotulada como preservativo.',
            correct: 'Laqueadura/vasectomia são definitivos — não barreira de látex.',
          },
          {
            label: 'Letra B — pílula',
            detail: 'Hormonal oral como única prevenção de IST.',
            correct: 'Anticoncepcional hormonal não protege contra IST.',
          },
          {
            label: 'Letra C — injetável',
            detail: 'Injeção hormonal com mesma promessa.',
            correct: 'Método hormonal — sem barreira mecânica para IST.',
          },
          {
            label: 'Letra D — espermicida',
            detail: 'Gel espermicida como único método.',
            correct: 'Espermicida não substitui preservativo na prevenção de IST.',
          },
          {
            label: 'Transferência — pílula do dia seguinte',
            detail: 'Em outra banca, emergência contraceptiva confunde.',
            correct: 'Figura e texto pedem preservativo de barreira.',
          },
        ],
        footer_rule: 'E = preservativo masculino e feminino',
      },
    ],
  },

  'fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-6': {
    family: 'conceito',
    branch: 'promocao_generico',
    guideline: 'Higiene bucal — Guia Prático do Cuidador (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Higiene bucal — MS',
        meta: slideMeta,
        items: [
          { label: 'Higiene oral', detail: 'Previne cáries, tártaro, gengivite e dor.', icon: 'Smile' },
          { label: 'Guia do Cuidador', detail: 'Referência MS para cuidadores de adultos e idosos.', icon: 'BookOpen' },
          { label: 'Escovação', detail: 'Após refeições e após medicamentos orais.', icon: 'RefreshCw' },
          { label: 'Prevenção', detail: 'Promoção bucal na atenção básica e domicílio.', icon: 'Shield' },
          { label: 'Pegadinha horário', detail: 'Só manhã/noite ou só 3×/dia — incompleto no guia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Refeição e medicamento oral = escovar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: higiene bucal de adultos e idosos — Guia Prático do Cuidador.',
          'Eliminar A — só ao acordar e antes de dormir: insuficiente.',
          'Eliminar B — após refeições e após água: água não exige escovação extra.',
          'Eliminar D — três vezes por período do dia: não é a orientação literal do guia.',
          'Manter C — após cada refeição e após uso de remédios pela boca.',
          'Marcar letra C.',
          'Em similares: medicamento oral pode deixar resíduo — escovar depois.',
        ],
        footer_rule: 'MS: escova após comer e após medicação oral',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HIGIENE BUCAL — CUIDADOR',
        rows: [
          { label: 'Quando', value: 'Após refeições + após meds orais', badge: 'hot' },
          { label: 'Por quê', value: 'Reduz placa, cárie e gengivite', badge: 'hot' },
          { label: 'Público', value: 'Adultos e idosos assistidos', badge: 'ok' },
          { label: 'Erro', value: 'Só 2×/dia sem considerar refeições', badge: 'warn' },
        ],
        footer_rule: 'Promoção bucal no cuidado domiciliar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCOVAÇÃO',
        items: [
          {
            label: 'Letra A — 2×/dia',
            detail: 'Ao acordar e antes de dormir apenas.',
            correct: 'Guia orienta também após refeições e medicamentos orais.',
          },
          {
            label: 'Letra B — após água',
            detail: 'Inclui ingestão de água como gatilho.',
            correct: 'Água não substitui escovação pós-refeição.',
          },
          {
            label: 'Letra D — 3 períodos',
            detail: 'Manhã, tarde e noite fixos.',
            correct: 'Orientação é por refeição e medicação oral — letra C.',
          },
          {
            label: 'Transferência — fio dental',
            detail: 'Fio dental é complemento, não horário de escova.',
            correct: 'Questão pede frequência de escovação do guia.',
          },
        ],
        footer_rule: 'C = após refeições e remédios orais',
      },
    ],
  },

  'fauel-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-7': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Relação de cuidado — empatia na educação e promoção em saúde (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Empatia no cuidado',
        meta: slideMeta,
        items: [
          { label: 'Empatia', detail: 'Colocar-se no lugar do outro — perceber sentimentos vividos.', icon: 'Heart' },
          { label: 'Educação em saúde', detail: 'Escuta ativa facilita adesão e promoção.', icon: 'MessageCircle' },
          { label: 'Simpatia', detail: 'Boa vontade — não é necessariamente compreensão profunda.', icon: 'Users' },
          { label: 'Dignidade', detail: 'Respeito ao ser — conceito ético distinto.', icon: 'Shield' },
          { label: 'Pegadinha termos', detail: 'Banca testa definição literal de empatia.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Empatia = compreender a experiência do outro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: capacidade de se colocar no lugar do outro e perceber sentimentos.',
          'Eliminar B — simpatia: afeto ou afinidade, não vivência do outro.',
          'Eliminar C — dignidade: valor intrínseco da pessoa.',
          'Eliminar D — amorosidade: afeto/carinho — não definição técnica pedida.',
          'Manter A — empatia.',
          'Marcar letra A.',
          'Em similares: empatia ≠ simpatia na comunicação em saúde.',
        ],
        footer_rule: 'Base da escuta qualificada na APS',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'EMPATIA × SIMPATIA',
        rows: [
          { label: 'Empatia', value: 'Compreender o que o outro sente', badge: 'hot' },
          { label: 'Simpatia', value: 'Sentir afinidade — não é a mesma coisa', badge: 'warn' },
          { label: 'No cuidado', value: 'Vínculo e adesão à promoção', badge: 'ok' },
          { label: 'Dignidade', value: 'Respeito — conceito paralelo', badge: 'info' },
        ],
        footer_rule: 'Promoção exige escuta empática',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RELAÇÃO DE CUIDADO',
        items: [
          {
            label: 'Letra B — simpatia',
            detail: 'Boa vontade ou afinidade com o outro.',
            correct: 'Simpatia não exige vivenciar a perspectiva do outro.',
          },
          {
            label: 'Letra C — dignidade',
            detail: 'Respeito à condição humana.',
            correct: 'É princípio ético — não define “colocar-se no lugar”.',
          },
          {
            label: 'Letra D — amorosidade',
            detail: 'Demonstração de carinho.',
            correct: 'Afeto não é sinônimo técnico de empatia.',
          },
          {
            label: 'Transferência — compaixão',
            detail: 'Compaixão pode implicar pena — distinto na literatura.',
            correct: 'Definição literal da banca: empatia.',
          },
        ],
        footer_rule: 'A = empatia na relação de cuidado',
      },
    ],
  },

  'fenix-instituto-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-4': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Cuidado terapêutico — medicação correta, acompanhamento e educação (MS)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cuidado terapêutico',
        meta: slideMeta,
        items: [
          { label: 'Lacuna', detail: 'Administração correta + acompanhamento + educação em saúde.', icon: 'Pill' },
          { label: 'Recuperação', detail: 'Orientações visam cura e prevenção de complicações.', icon: 'Heart' },
          { label: 'Educação', detail: 'Paciente entende tratamento — adesão terapêutica.', icon: 'GraduationCap' },
          { label: 'Vigilância', detail: 'Monitoramento populacional e epidemiológico são ações distintas.', icon: 'Eye' },
          { label: 'Pegadinha vigilância', detail: 'Busca de casos ≠ cuidado individual terapêutico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Cuidado terapêutico = conjunto centrado no paciente',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preencher lacuna — medicação correta, acompanhamento e educação.',
          'Eliminar A — monitoramento populacional: escala coletiva, não cuidado individual.',
          'Eliminar B — vigilância epidemiológica: detectar agravos na população.',
          'Eliminar D — controle sanitário: normas e inspeção de riscos ambientais.',
          'Manter C — cuidado terapêutico.',
          'Marcar letra C.',
          'Em similares: tríade medicação + seguimento + educação = cuidado terapêutico.',
        ],
        footer_rule: 'Prevenção de complicações no plano terapêutico',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CUIDADO TERAPÊUTICO',
        rows: [
          { label: 'Medicação', value: 'Administração correta', badge: 'hot' },
          { label: 'Acompanhamento', value: 'Seguimento clínico', badge: 'hot' },
          { label: 'Educação', value: 'Orientação ao paciente', badge: 'ok' },
          { label: '≠', value: 'Vigilância epidemiológica', badge: 'warn' },
        ],
        footer_rule: 'Integralidade do cuidado na APS',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LACUNA',
        items: [
          {
            label: 'Letra A — monitoramento populacional',
            detail: 'Indicadores de saúde coletiva.',
            correct: 'Não descreve cuidado individual com medicamento e educação.',
          },
          {
            label: 'Letra B — vigilância epidemiológica',
            detail: 'Notificação e controle de agravos.',
            correct: 'Ação de vigilância — não o processo terapêutico ao paciente.',
          },
          {
            label: 'Letra D — controle sanitário',
            detail: 'Fiscalização de produtos e serviços.',
            correct: 'Sanitária — fora do cuidado clínico-educativo.',
          },
          {
            label: 'Transferência — adesão',
            detail: 'Adesão é parte do cuidado, não nome da lacuna.',
            correct: 'Termo completo pedido: cuidado terapêutico.',
          },
        ],
        footer_rule: 'C = cuidado terapêutico',
      },
    ],
  },

  'fepese-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-6': {
    family: 'conceito',
    branch: 'promocao_principios_direitos',
    guideline: 'Níveis de atenção — primário = UBS e ações de baixa densidade (Lei 8.080/MS)',
    sources: [LEI_8080_SOURCE, MS_PROMOCAO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Atenção primária — SUS',
        meta: slideMeta,
        items: [
          { label: 'Três níveis', detail: 'Primário, secundário e terciário — hierarquia do SUS.', icon: 'Layers' },
          { label: 'Primário', detail: 'UBS — porta de entrada e coordenação do cuidado.', icon: 'Home' },
          { label: 'Secundário', detail: 'Especialidades ambulatoriais e hospital de média complexidade.', icon: 'Stethoscope' },
          { label: 'Terciário', detail: 'Alta complexidade — hospitais de referência.', icon: 'Building' },
          { label: 'Pegadinha UPA', detail: 'UPA é urgência — não define atenção primária.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Primário = APS nas UBS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que é correto sobre o nível primário de atenção.',
          'Eliminar A — UPA no primário: UPA é urgência, média complexidade.',
          'Eliminar B — alta complexidade hospitalar: é terciário.',
          'Eliminar C — serviços especializados hospitalares: secundário/terciário.',
          'Eliminar E — hospitais no primário: confunde níveis.',
          'Manter D — constituído principalmente pelas UBS.',
          'Marcar letra D.',
          'Em similares: primário = APS — promoção e prevenção na UBS.',
        ],
        footer_rule: 'UBS = núcleo da atenção primária',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'NÍVEIS DE ATENÇÃO',
        rows: [
          { label: 'Primário', value: 'UBS — APS, promoção, prevenção', badge: 'hot' },
          { label: 'Secundário', value: 'Especialidades e média complexidade', badge: 'ok' },
          { label: 'Terciário', value: 'Alta complexidade', badge: 'ok' },
          { label: 'Erro', value: 'UPA ou hospital = primário', badge: 'warn' },
        ],
        footer_rule: 'Hierarquização do SUS — Lei 8.080',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NÍVEL PRIMÁRIO',
        items: [
          {
            label: 'Letra A — UPA',
            detail: 'Unidade de Pronto Atendimento no primário.',
            correct: 'UPA é urgência — não é porta de entrada da APS.',
          },
          {
            label: 'Letra B — alta complexidade',
            detail: 'Hospitais de referência como primário.',
            correct: 'Alta complexidade é terciário.',
          },
          {
            label: 'Letra C — especializado hospitalar',
            detail: 'Ambulatórios de alta densidade no primário.',
            correct: 'Especialidades são secundário.',
          },
          {
            label: 'Letra E — hospital primário',
            detail: 'Hospitais e centros de alta densidade.',
            correct: 'Primário é UBS e ações de baixa densidade.',
          },
          {
            label: 'Transferência — ESF',
            detail: 'ESF é estratégia dentro do primário — reforça D.',
            correct: 'UBS/ESF = núcleo do nível primário.',
          },
        ],
        footer_rule: 'D = UBS no nível primário',
      },
    ],
  },

  'fgv-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563923516-5': {
    family: 'conceito',
    branch: 'promocao_educacao_prevencao',
    guideline: 'Busca ativa — sintomático respiratório com tosse > 3 semanas (MS/TB)',
    sources: [MS_TB_SOURCE, MS_PROMOCAO_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sintomático respiratório',
        meta: slideMeta,
        items: [
          { label: 'Busca ativa', detail: 'Equipe rastreia sintomáticos respiratórios no território.', icon: 'Search' },
          { label: 'Tosse', detail: 'Critério MS: duração superior a três semanas.', icon: 'Wind' },
          { label: 'Vigilância', detail: 'Prevenção e controle de TB na APS.', icon: 'Eye' },
          { label: 'Pegadinha prazo', detail: 'Alternativas com dias ou duas semanas — curto demais.', icon: 'AlertTriangle' },
          { label: 'Promoção', detail: 'Identificar cedo reduz transmissão comunitária.', icon: 'Shield' },
        ],
        footer_rule: 'Tosse prolongada — investigar sintomático respiratório',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: busca ativa de sintomáticos respiratórios — tosse por período.',
          'Eliminar A — alternativa de cinco dias: prazo insuficiente.',
          'Eliminar B — alternativa de sete dias: ainda abaixo do critério nacional.',
          'Eliminar C — alternativa de dez dias: não é o corte clássico de SR.',
          'Eliminar D — alternativa de duas semanas: próximo, mas MS usa três semanas.',
          'Manter E — tosse por período superior a três semanas.',
          'Marcar letra E.',
          'Em similares: sintomático respiratório — tosse prolongada além de três semanas (MS).',
        ],
        footer_rule: 'Vigilância em saúde na comunidade',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINTOMÁTICO RESPIRATÓRIO',
        rows: [
          { label: 'Critério', value: 'Tosse prolongada — SR (MS/TB)', badge: 'hot' },
          { label: 'Ação', value: 'Busca ativa + escarro', badge: 'hot' },
          { label: 'Nível', value: 'APS / vigilância epidemiológica', badge: 'ok' },
          { label: 'Erro', value: 'Prazos curtos (dias ou duas semanas)', badge: 'warn' },
        ],
        footer_rule: 'Prevenção de TB no território',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRAZO DA TOSSE',
        items: [
          {
            label: 'Letra A — cinco dias',
            detail: 'Tosse por período curto — alternativa A.',
            correct: 'Prazo muito curto — gripe comum pode durar cerca de uma semana.',
          },
          {
            label: 'Letra B — sete dias',
            detail: 'Tosse por pouco mais de uma semana.',
            correct: 'Ainda não atinge o critério prolongado do manual MS.',
          },
          {
            label: 'Letra C — dez dias',
            detail: 'Tosse por dez dias.',
            correct: 'Critério nacional é três semanas — não dez dias.',
          },
          {
            label: 'Letra D — duas semanas',
            detail: 'Tosse por duas semanas.',
            correct: 'Armadilha comum — MS define três semanas.',
          },
          {
            label: 'Transferência — hemoptise',
            detail: 'Sangue na tosse acelera investigação.',
            correct: 'A questão pede o corte temporal da tosse — alternativa E.',
          },
        ],
        footer_rule: 'E = tosse por mais de três semanas na busca ativa',
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
    console.log(`[handcraft:promocao-g05] OK ${slug}`);
  }
  console.log(`[handcraft:promocao-g05] total=${ok}`);
}

main();
