#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — saude-da-mulher-g06 (8 slugs pré-natal P0).
 *
 *   npm run handcraft:saude-da-mulher-g06
 *   npm run audit:questao-readiness -- --lote=saude-da-mulher-g06 --strict-v3-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'saude-da-mulher-g06';
const SUBTOPICO = 'Saúde da Mulher';
const REVIEWED = '2026-07-09';

const AB32_SOURCE = {
  id: 'caderno-ab-32-prenatal',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica nº 32 — Atenção ao pré-natal de baixo risco',
  year: 2012,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_32_prenatal.pdf',
  covers: [
    'planejamento familiar',
    'síndrome HELLP',
    'gravidez múltipla',
    'aborto OMS',
    'amenorreia',
    'líquido amniótico',
    'alto risco gestacional',
  ],
};

const PF_SOURCE = {
  id: 'ms-planejamento-familiar',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cadernos de Atenção Básica — Planejamento familiar',
  year: 2013,
  url: 'https://bvsms.saude.gov.br/bvs/publicacoes/cadernos_atencao_basica_26_planejamento_familiar.pdf',
  covers: ['intervalo intergestacional', 'morbimortalidade materno-infantil'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'mulher_prenatal' | 'mulher_planejamento' | 'mulher_parto';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'legis';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  sources?: (typeof AB32_SOURCE | typeof PF_SOURCE)[];
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
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [AB32_SOURCE],
  };
}

function cleanPdfNoise(s: string): string {
  return s
    .replace(/\n?\d{4}\)\s*/g, '\n')
    .replace(/pré-eclâmpsia\s+\d+/gi, 'pré-eclâmpsia')
    .replace(/\s+/g, ' ')
    .trim();
}

const HELLP_SLIDES = [
  {
    type: 'concept_map',
    slide_title: 'Síndrome HELLP',
    meta: slideMeta,
    items: [
      { label: 'Comando', detail: 'Principal complicação da síndrome HELLP na gravidez.', icon: 'Target' },
      { label: 'HELLP', detail: 'Hemólise + enzimas hepáticas elevadas + plaquetas baixas.', icon: 'Activity' },
      { label: 'Complicação (D)', detail: 'Distúrbios hematológicos — eixo da síndrome.', icon: 'Droplets' },
      { label: 'Pegadinha renal isolada', detail: 'Insuficiência renal pode ocorrer, mas o núcleo é hematológico.', icon: 'AlertTriangle' },
    ],
    footer_rule: 'HELLP = distúrbio hematológico',
  },
  {
    type: 'golden_rule',
    slide_title: 'HELLP — mnemônico',
    meta: slideMeta,
    content: 'SÍNDROME HELLP',
    rows: [
      { label: 'H', value: 'Hemólise', badge: 'hot' },
      { label: 'EL', value: 'Enzimas hepáticas elevadas', badge: 'info' },
      { label: 'LP', value: 'Low Platelets — plaquetopenia', badge: 'hot', emphasis: 'highlight' },
      { label: 'Complicação', value: 'Distúrbios hematológicos', badge: 'hot' },
    ],
    footer_rule: 'Hemólise + plaquetopenia = hematológico',
  },
  {
    type: 'logic_flow',
    reveal_mode: 'tap',
    meta: slideMeta,
    steps: [
      'Reconhecer HELLP como extremo da pré-eclâmpsia.',
      'Eliminar A — complicações GI: não são a principal classificação.',
      'Eliminar B — insuficiência renal: consequência possível, não eixo principal.',
      'Eliminar C — problemas respiratórios: não definem HELLP.',
      'Testar D — distúrbios hematológicos (hemólise e plaquetopenia).',
      'Eliminar E — anomalias cardíacas fetais: não é a complicação materna principal.',
      'Marcar letra D.',
    ],
    footer_rule: 'HELLP → distúrbios hematológicos',
  },
  {
    type: 'danger_zone',
    bullet_style: 'x_icon',
    meta: slideMeta,
    content: 'PEGADINHAS — HELLP',
    items: [
      { label: 'Letra A — gastrointestinal', detail: 'Sintomas GI podem existir, mas não são o eixo.', correct: 'HELLP é síndrome hematológica — hemólise e plaquetas.' },
      { label: 'Letra B — renal', detail: 'Pegadinha de órgão-alvo isolado.', correct: 'Núcleo: distúrbios hematológicos — letra D.' },
      { label: 'Letra C — respiratório', detail: 'Não classifica a síndrome HELLP.', correct: 'Hemólise e plaquetopenia definem HELLP.' },
      { label: 'Letra E — cardíaco fetal', detail: 'Foco fetal, não complicação materna principal.', correct: 'Distúrbios hematológicos maternos — D.' },
    ],
    footer_rule: 'Hemólise + plaquetas → D',
  },
];

const SPECS: Record<string, Pack> = {
  'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1780067048498-0': {
    family: 'conceito',
    branch: 'mulher_planejamento',
    guideline: 'MS planejamento familiar (2013) — intervalo intergestacional reduz morbimortalidade',
    sources: [PF_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PF — morbimortalidade',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atenção em planejamento familiar reduz morbimortalidade materna e infantil.', icon: 'Target' },
          { label: 'Intervalo (C)', detail: 'Aumenta intervalo entre gestações — menos baixo peso e amamentação adequada.', icon: 'Calendar' },
          { label: 'Pegadinha cesárea', detail: 'PF não aumenta cesáreas para ligadura tubária — distrator A.', icon: 'AlertTriangle' },
          { label: 'Pegadinha proibir gravidez', detail: 'Não impossibilita gravidez em adolescentes ou patologias crônicas — D falso.', icon: 'XCircle' },
        ],
        footer_rule: 'Regulação da fecundidade protege mãe e bebê',
      },
      {
        type: 'golden_rule',
        slide_title: 'PF — benefícios',
        meta: slideMeta,
        content: 'PLANEJAMENTO FAMILIAR',
        rows: [
          { label: 'Fecundidade', value: 'Regulação com direitos iguais da mulher e do casal', badge: 'info' },
          { label: 'Intervalo', value: 'Entre gestações — reduz baixo peso', badge: 'hot', emphasis: 'highlight' },
          { label: 'Amamentação', value: 'Tempo para aleitamento materno adequado', badge: 'info' },
          { label: 'Não é', value: 'Mais cesáreas ou falta de anticoncepcionais', badge: 'warn' },
        ],
        footer_rule: 'Espaçar gestações → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Planejamento familiar contribui para redução da morbimortalidade materna e infantil.',
          'Eliminar A — aumentar cesáreas para ligadura tubária.',
          'Eliminar B — ligaduras por falta de acesso a anticoncepcionais.',
          'Testar C — intervalo entre gestações, baixo peso e amamentação.',
          'Eliminar D — impossibilitar gravidez em adolescentes ou crônicas descompensadas.',
          'Marcar letra C.',
        ],
        footer_rule: 'Intervalo intergestacional → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PF',
        items: [
          { label: 'Letra A — cesárea', detail: 'Confunde PF com esterilização cirúrgica.', correct: 'Benefício: intervalo entre gestações — C.' },
          { label: 'Letra B — ligaduras', detail: 'Falta de métodos não é benefício do PF.', correct: 'Espaçar gestações reduz baixo peso.' },
          { label: 'Letra D — proibir gravidez', detail: 'PF regula, não impede categoricamente.', correct: 'Intervalo e amamentação — letra C.' },
          { label: 'Confundir com esterilização', detail: 'Laqueadura não é o único método.', correct: 'Morbimortalidade cai com intervalo adequado.' },
        ],
        footer_rule: 'PF ≠ mais cesárea',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1777104389226-7': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'MS/Caderno AB 32 — síndrome HELLP: hemólise, enzimas hepáticas e plaquetopenia',
    slides: HELLP_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1778712437306-0': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'MS/Caderno AB 32 — síndrome HELLP: hemólise, enzimas hepáticas e plaquetopenia',
    slides: HELLP_SLIDES,
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1778712437306-1': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — gravidez múltipla: alto risco com possível condução na APS + referência',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gestação múltipla — pré-natal',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Assistência pré-natal em gestação múltipla (alto risco).', icon: 'Target' },
          { label: 'UBS + referência (B)', detail: 'Pode iniciar na APS se houver encaminhamento ao alto risco.', icon: 'Home' },
          { label: 'Pegadinha obrigatório 12ª sem', detail: 'Encaminhamento não é automático na 12ª semana em todos os casos — A falso.', icon: 'AlertTriangle' },
          { label: 'Pegadinha exclusivo alta complexidade', detail: 'Não é exclusivo de alta complexidade — D falso.', icon: 'XCircle' },
        ],
        footer_rule: 'APS possível com rede de referência',
      },
      {
        type: 'golden_rule',
        slide_title: 'Gemelar — rede de cuidado',
        meta: slideMeta,
        content: 'GESTAÇÃO MÚLTIPLA',
        rows: [
          { label: 'Risco', value: 'Gestação múltipla = alto risco', badge: 'warn' },
          { label: 'APS', value: 'Condução possível com encaminhamento', badge: 'hot', emphasis: 'highlight' },
          { label: 'Consultas', value: 'Mais frequentes que gestação única', badge: 'info' },
          { label: 'Não é', value: 'Exclusivo alta complexidade ou USG mensal obrigatório', badge: 'warn' },
        ],
        footer_rule: 'UBS + referência → B',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Gestação múltipla = alto risco, mas rede pode incluir APS.',
          'Eliminar A — encaminhamento obrigatório na 12ª semana universal.',
          'Testar B — pré-natal na UBS com profissional ciente e encaminhamento.',
          'Eliminar C — mesma frequência de gestação única.',
          'Eliminar D — exclusivamente alta complexidade.',
          'Eliminar E — USG mensal obrigatória.',
          'Marcar letra B.',
        ],
        footer_rule: 'APS com referência → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GESTAÇÃO MÚLTIPLA',
        items: [
          { label: 'Letra A — 12ª semana', detail: 'Generaliza encaminhamento obrigatório precoce.', correct: 'APS pode conduzir com referência — B.' },
          { label: 'Letra C — frequência única', detail: 'Gestação múltipla exige mais consultas.', correct: 'UBS com encaminhamento — letra B.' },
          { label: 'Letra D — só alta complexidade', detail: 'Exclui atenção primária na rede.', correct: 'Pode ser na UBS com referência.' },
          { label: 'Letra E — USG mensal', detail: 'Obrigatoriedade absoluta não é o padrão MS.', correct: 'Condução na APS com encaminhamento — B.' },
        ],
        footer_rule: 'Alto risco ≠ só hospital',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067024707-7': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'OMS (1977) — aborto: término da gestação antes da 22ª semana ou feto <500 g',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Definição OMS — aborto',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Completar definição clássica de aborto pela Organização Mundial de Saúde.', icon: 'Target' },
          { label: 'Limite temporal', detail: 'Término da gestação antes do marco gestacional clássico OMS.', icon: 'Calendar' },
          { label: 'Limite ponderal', detail: 'Feto com peso abaixo do limite definido pela OMS.', icon: 'Scale' },
          { label: 'Pegadinha combinações incorretas', detail: 'Banca troca semana e peso — só uma alternativa fecha os dois critérios.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'OMS: semana + peso em sequência',
      },
      {
        type: 'golden_rule',
        slide_title: 'OMS — aborto',
        meta: slideMeta,
        content: 'DEFINIÇÃO CLÁSSICA',
        rows: [
          { label: 'Tempo', value: 'Antes do marco gestacional OMS', badge: 'hot', emphasis: 'highlight' },
          { label: 'Peso', value: 'Feto abaixo do limite ponderal OMS', badge: 'hot' },
          { label: 'Formato prova', value: 'Semana / peso em sequência na alternativa', badge: 'info' },
          { label: 'Pegadinha', value: 'Trocar só semana ou só peso — distratores', badge: 'warn' },
        ],
        footer_rule: 'Par temporal + ponderal → letra C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Definição OMS exige semana E peso na mesma alternativa.',
          'Eliminar A — semana abaixo do limite clássico.',
          'Eliminar B — combinações incorretas de semana e peso.',
          'Testar C — par clássico da definição OMS.',
          'Eliminar D — acima dos limites de aborto.',
          'Marcar letra C.',
        ],
        footer_rule: 'Definição OMS → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DEFINIÇÃO OMS',
        items: [
          { label: 'Pegadinha combinações incorretas', detail: 'Banca troca semana e peso entre alternativas.', correct: 'Só letra C fecha os dois critérios OMS em sequência.' },
          { label: 'Letra A — semana precoce', detail: 'Semana abaixo do limite OMS clássico.', correct: 'Par correto na alternativa C.' },
          { label: 'Letra B — par errado', detail: 'Nenhum parâmetro da combinação bate com OMS.', correct: 'Combinações incorretas — gabarito C.' },
          { label: 'Letra D — acima do limite', detail: 'Semana e peso acima do aborto OMS.', correct: 'Definição clássica → letra C.' },
        ],
        footer_rule: 'Par semana+peso → C',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-saude-da-mulher-1780067036141-3': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — amenorreia secundária: estresse, dieta, TCA; descalcificação não causa atraso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Atraso menstrual — EXCETO',
        meta: slideMeta,
        items: [
          { label: 'Comando EXCETO', detail: 'Menstruação atrasada nem sempre é gravidez — achar causa que NÃO explica atraso.', icon: 'Target' },
          { label: 'Estresse (A)', detail: 'Excesso de estresse e emoções fortes podem atrasar menstruação.', icon: 'Brain' },
          { label: 'Pegadinha descalcificação', detail: 'Descalcificação óssea NÃO causa atraso menstrual — exceção/gabarito.', icon: 'AlertTriangle' },
          { label: 'Dieta/TCA (C/D)', detail: 'Dietas restritivas, cafeína, álcool e anorexia/bulimia alteram ciclo.', icon: 'Utensils' },
        ],
        footer_rule: 'Descalcificação ≠ causa de amenorreia',
      },
      {
        type: 'golden_rule',
        slide_title: 'Amenorreia secundária',
        meta: slideMeta,
        content: 'ATRASO MENSTRUAL',
        rows: [
          { label: 'Estresse', value: 'Emoções fortes e alterações hormonais', badge: 'info' },
          { label: 'Dieta/TCA', value: 'Má alimentação, anorexia ou bulimia', badge: 'info' },
          { label: 'Cafeína/álcool', value: 'Consumo exagerado pode alterar ciclo', badge: 'warn' },
          { label: 'EXCETO', value: 'Descalcificação óssea — não causa atraso', badge: 'hot', emphasis: 'highlight' },
        ],
        footer_rule: 'B é a exceção',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato EXCETO: três causas verdadeiras + uma falsa.',
          'Testar A — estresse: causa válida → eliminar.',
          'Testar B — descalcificação óssea: NÃO causa atraso → gabarito.',
          'Testar C — dietas restritivas: causa válida → eliminar.',
          'Testar D — anorexia/bulimia: causa válida → eliminar.',
          'Marcar letra B.',
        ],
        footer_rule: 'EXCETO → descalcificação → B',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'EXCETO — CAUSAS DE ATRASO',
        items: [
          { label: 'Letra A — estresse', detail: 'Estresse é causa reconhecida de amenorreia.', correct: 'Afirmativa correta como causa — não é o EXCETO.' },
          { label: 'Letra B — descalcificação', detail: 'Não explica atraso menstrual.', correct: 'Exceção: descalcificação óssea não causa amenorreia — gabarito.' },
          { label: 'Letra C — dietas', detail: 'Restrição calórica altera eixo hormonal.', correct: 'Afirmativa correta — dieta restritiva pode atrasar menstruação.' },
          { label: 'Letra D — TCA', detail: 'Anorexia/bulimia causam amenorreia secundária.', correct: 'Conduta correta como causa — não é o EXCETO.' },
        ],
        footer_rule: 'Só B não é causa',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-nocoes-de-fisiologia-1778934957741-3': {
    family: 'conceito',
    branch: 'mulher_prenatal',
    guideline: 'Caderno AB 32 (MS) — líquido amniótico: vérnix caseoso visível no terceiro trimestre',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Líquido amniótico — vérnix',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Análise macroscópica do líquido amniótico e maturidade fetal.', icon: 'Target' },
          { label: 'Marco (A)', detail: 'Grumos de vérnix caseoso em suspensão no terceiro trimestre.', icon: 'Droplets' },
          { label: 'Maturidade fetal', detail: 'Vérnix em suspensão indica maturidade na análise macroscópica.', icon: 'Microscope' },
          { label: 'Pegadinha semanas precoces', detail: 'Meio da gestação ou termo tardio — marco da prova é anterior ao termo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Vérnix visível no terceiro trimestre',
      },
      {
        type: 'golden_rule',
        slide_title: 'LA — sinais de maturidade',
        meta: slideMeta,
        content: 'LÍQUIDO AMNIÓTICO',
        rows: [
          { label: 'Vérnix caseoso', value: 'Grumos em suspensão no LA', badge: 'hot', emphasis: 'highlight' },
          { label: 'Marco prova', value: 'Terceiro trimestre — alternativa A', badge: 'hot' },
          { label: 'Segundo trimestre', value: 'Cedo para achado típico em suspensão', badge: 'warn' },
          { label: 'Termo tardio', value: 'Já presente — mas marco cobrado é mais precoce', badge: 'info' },
        ],
        footer_rule: 'Maturidade macroscópica → A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: análise macroscópica do líquido amniótico e vérnix caseoso.',
          'Eliminar D — meio da gestação: muito precoce.',
          'Eliminar C — segundo trimestre tardio: ainda precoce para grumos típicos.',
          'Eliminar B — termo tardio: já presente, mas marco clássico é anterior.',
          'Testar A — marco do terceiro trimestre cobrado na prova.',
          'Marcar letra A.',
        ],
        footer_rule: 'Vérnix em LA → letra A',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MATURIDADE FETAL',
        items: [
          { label: 'Pegadinha semanas precoces', detail: 'Meio da gestação ou segundo trimestre — cedo demais.', correct: 'Grumos típicos no terceiro trimestre — letra A.' },
          { label: 'Letra B — termo tardio', detail: 'Vérnix já existe, mas não é o marco da questão.', correct: 'Marco da análise macroscópica — alternativa A.' },
          { label: 'Letra C — segundo trimestre', detail: 'Ainda precoce para grumos em suspensão.', correct: 'Terceiro trimestre — letra A.' },
          { label: 'Letra D — meio da gestação', detail: 'Gestação imatura para achado típico.', correct: 'Vérnix caseoso em suspensão — marco A.' },
        ],
        footer_rule: 'Terceiro trimestre = marco',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idib-enfermagem-saude-da-mulher-1777104335102-1': {
    family: 'protocolo',
    branch: 'mulher_prenatal',
    guideline: 'MS manual alto risco — equipe referência capacita APS no manejo de gestante de alto risco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Alto risco — educação permanente',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Ação educacional da equipe de alto risco além do atendimento direto.', icon: 'Target' },
          { label: 'Capacitação APS (C)', detail: 'Formar equipes da atenção primária presencial e à distância.', icon: 'Users' },
          { label: 'Pegadinha só prontuário (A)', detail: 'Registrar é rotina — não é capacitação de equipes.', icon: 'AlertTriangle' },
          { label: 'Pegadinha exame sem formação (B)', detail: 'Solicitar exame sem capacitar interpretação.', icon: 'XCircle' },
        ],
        footer_rule: 'Educar APS = papel da referência',
      },
      {
        type: 'golden_rule',
        slide_title: 'Rede — alto risco × APS',
        meta: slideMeta,
        content: 'COMPETÊNCIA EDUCACIONAL',
        rows: [
          { label: 'Referência', value: 'Capacitar APS no manejo de alto risco', badge: 'hot', emphasis: 'highlight' },
          { label: 'Metodologia', value: 'Ativa, interdisciplinar, presencial e EAD', badge: 'info' },
          { label: 'Prontuário', value: 'Registro é rotina — não é o foco da questão', badge: 'warn' },
          { label: 'Urgência', value: 'Intervir sem orientar APS — inadequado', badge: 'warn' },
        ],
        footer_rule: 'Formação de equipes → C',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar competência educacional da equipe de alto risco.',
          'Eliminar A — só registro em prontuário.',
          'Eliminar B — exames sem formar equipe.',
          'Testar C — capacitar APS presencial e à distância com metodologias ativas.',
          'Eliminar D — intervir sem comunicar APS.',
          'Marcar letra C.',
        ],
        footer_rule: 'Capacitação APS → C',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PAPEL EDUCACIONAL',
        items: [
          { label: 'Letra A — prontuário', detail: 'Registro é atribuição rotineira.', correct: 'Além do básico: capacitar APS — letra C.' },
          { label: 'Letra B — exame sem formação', detail: 'Não educa a equipe da APS.', correct: 'Capacitação com metodologias ativas — C.' },
          { label: 'Letra D — urgência sem orientar', detail: 'Falta articulação com APS.', correct: 'Formação permanente das equipes — C.' },
          { label: 'Confundir atendimento × educação', detail: 'Questão pede formação de equipes.', correct: 'Capacitar APS no alto risco — C.' },
        ],
        footer_rule: 'Referência educa APS',
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
    console.log(`[handcraft:sm-g06] OK ${slug}`);
  }
  console.log(`[handcraft:sm-g06] total=${ok}`);
}

main();
