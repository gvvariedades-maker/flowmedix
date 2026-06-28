import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  buildPackageSlidesForFamily,
  canBuildPackagePremiumSlides,
  type BuildPackageSlidesInput,
  type ChoicePackageConfig,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
} from '@/lib/catalogMigration/upgradePremiumVfCore';

export const RESPIRATORIO_DPOC_VF_GOLDEN_FILE =
  'questao-premium-cpcon-dpoc-oxigenoterapia-alvo-vf.json';
export const RESPIRATORIO_PEAK_FLOW_GOLDEN_FILE =
  'questao-premium-fgv-respiratorio-peak-flow-zonas-vf.json';
export const RESPIRATORIO_CORTICOIDE_GOLDEN_FILE =
  'questao-premium-idecan-respiratorio-corticoide-inalatorio-conceito.json';
export const RESPIRATORIO_ESPACADOR_GOLDEN_FILE =
  'questao-premium-idecan-respiratorio-espacador-inalador-conceito.json';
export const RESPIRATORIO_CRISE_EXCETO_GOLDEN_FILE =
  'questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json';
export const RESPIRATORIO_EXACERBACAO_GOLDEN_FILE =
  'questao-premium-cebraspe-respiratorio-dpoc-exacerbacao-vf.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Asma e DPOC';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'Separar asma (reversível) de DPOC (persistente) antes de marcar.',
    goldenContent: 'ASMA × DPOC — DIFERENCIAÇÃO',
    goldenFooter: 'Asma responde a broncodilatador; DPOC tem risco de retenção de CO₂.',
    logicFooter: 'Identificar patologia → conduta de O₂ e medicamento.',
    logicFix: 'reversibilidade = asma; obstrução persistente = DPOC.',
    dangerContent: 'PEGADINHAS — ASMA E DPOC',
    dangerFooter: (id) => `Patologia e conduta corretas fecham letra ${id}.`,
    chipLabel: 'DRC',
  },
  'O₂ titulado / SpO₂ alvo': {
    conceptFooter: 'DPOC retentor: O₂ titulado — alvo moderado, não hiperóxia cega.',
    goldenContent: 'O₂ NA DPOC — TITULADO E MONITORADO',
    goldenFooter: 'SpO₂ 88–92% no retentor — 98–100% sem critério é pegadinha.',
    logicFooter: 'Hipoxemia sim; hiperóxia indiscriminada não.',
    logicFix: 'titular O₂ e monitorar SpO₂ — não buscar saturação máxima no retentor.',
    dangerContent: 'PEGADINHAS — OXIGENOTERAPIA NA DPOC',
    dangerFooter: (id) => `Alvo de SpO₂ e titulação fecham letra ${id}.`,
    chipLabel: 'O₂',
  },
  'Espaçador e inalador': {
    conceptFooter: 'Spray doseado + espaçador: exalar, disparar, apneia inspiratória.',
    goldenContent: 'INALADOR COM ESPAÇADOR — TÉCNICA',
    goldenFooter: 'Espaçador melhora deposição pulmonar; higiene com detergente neutro.',
    logicFooter: 'Técnica inalatória antes de julgar fluxo de O₂ ou nebulização.',
    logicFix: 'exalação completa → jato → apneia ≥10 s com espaçador valvulado.',
    dangerContent: 'PEGADINHAS — TÉCNICA INALATÓRIA',
    dangerFooter: (id) => `Técnica e higiene do espaçador fecham letra ${id}.`,
    chipLabel: 'INALADOR',
  },
  'Corticoide inalatório × resgate': {
    conceptFooter: 'Controlador diário; broncodilatador de curta ação só na crise ou sintomas.',
    goldenContent: 'ASMA — CONTROLADOR × RESGATE',
    goldenFooter: 'Suspender corticoide quando assintomático piora o controle.',
    logicFooter: 'Corticoide inalatório = manutenção; SABA = resgate.',
    logicFix: 'nunca ensinar que SABA substitui o controlador.',
    dangerContent: 'PEGADINHAS — INALADORES NA ASMA',
    dangerFooter: (id) => `Função de cada medicamento fecha letra ${id}.`,
    chipLabel: 'ASMA',
  },
  'Peak flow': {
    conceptFooter: 'Zona verde = controle; queda >20% do melhor PFE = alerta.',
    goldenContent: 'PEAK FLOW — ZONAS DA ASMA',
    goldenFooter: 'Verde mantém tratamento — resgate não é de hora em hora na verde.',
    logicFooter: 'Julgar PFE e zonas antes de combinar letras.',
    logicFix: 'comparar PFE com o melhor valor pessoal do paciente.',
    dangerContent: 'PEGADINHAS — PEAK FLOW',
    dangerFooter: (id) => `Zonas e alerta de queda fecham letra ${id}.`,
    chipLabel: 'PFE',
  },
  'Exacerbação DPOC': {
    conceptFooter: 'Escarro purulento, expiração prolongada e confusão = descompensação.',
    goldenContent: 'EXACERBAÇÃO DPOC — SINAIS',
    goldenFooter: 'Alteração neurológica pode indicar retenção de CO₂.',
    logicFooter: 'Tríade: dispneia + escarro + sinais de CO₂.',
    logicFix: 'confusão mental na DPOC exige avaliação urgente.',
    dangerContent: 'PEGADINHAS — EXACERBAÇÃO DPOC',
    dangerFooter: (id) => `Sinais de exacerbação e CO₂ fecham letra ${id}.`,
    chipLabel: 'DPOC',
  },
  'Crise asmática': {
    conceptFooter: 'Crise: monitorizar, posicionar, broncodilatador inalatório e O₂ se prescrito.',
    goldenContent: 'CRISE ASMÁTICA — ENFERMAGEM',
    goldenFooter: 'Broncodilatador inalatório é primeira linha na crise.',
    logicFooter: 'EXCETO: três distratores são condutas corretas.',
    logicFix: 'não restringir hidratação nem inventar condutas na crise asmática.',
    dangerContent: 'PEGADINHAS — CRISE ASMÁTICA',
    dangerFooter: (id) => `Cuidados imediatos válidos fecham letra ${id}.`,
    chipLabel: 'CRISE',
  },
  'Asma × DPOC — diferenciação': {
    conceptFooter: 'Asma = obstrução reversível; DPOC = persistente com risco de hipercapnia.',
    goldenContent: 'REVERSÍVEL × PERSISTENTE',
    goldenFooter: 'II verdadeira na asma; III falsa se pedir SpO₂ 98–100% sempre no DPOC.',
    logicFooter: 'Julgar cada afirmativa pelo mecanismo fisiopatológico.',
    logicFix: 'não tratar DPOC retentor como paciente que tolera hiperóxia.',
    dangerContent: 'PEGADINHAS — DIFERENCIAR ASMA E DPOC',
    dangerFooter: (id) => `Reversibilidade e alvo de O₂ fecham letra ${id}.`,
    chipLabel: 'DRC',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isRespiratorioCronicoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'doenças respiratórias crônicas (asma, dpoc)' ||
    n === 'doencas respiratorias cronicas (asma, dpoc)' ||
    n === 'asma e dpoc' ||
    n === 'asma' ||
    n === 'dpoc'
  );
}

export function inferRespiratorioCronicoTopic(
  instruction: string,
  options: QuestionOption[],
): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/peak flow|pfe\b|zona verde|zona amarela|zona vermelha/.test(blob)) return 'Peak flow';
  if (
    /corticoide inalat|controlador|uso regular.*corticoide|salbutamol.*assintom|manutenção da asma|manutencao da asma/.test(
      blob,
    )
  ) {
    return 'Corticoide inalatório × resgate';
  }
  if (/espaçador|espacador|inalador pressurizado|apneia inspiratória|apneia inspiratoria/.test(blob)) {
    return 'Espaçador e inalador';
  }
  if (
    /spo2|sp o2|saturação|saturacao|88.?92|98.?100|fio2|fi o2|oxigênio titulado|oxigenio titulado|retenção de co2|retencao de co2|hipercapnia/.test(
      blob,
    )
  ) {
    return 'O₂ titulado / SpO₂ alvo';
  }
  if (
    /exacerba|escarro purulento|tempo expiratório|tempo expiratorio|musculatura acessória|musculatura acessoria/.test(
      blob,
    )
  ) {
    return 'Exacerbação DPOC';
  }
  if (
    /\bexceto\b|crise asm|sibilância|sibilancia|broncoespasmo|tiragem intercostal|tiragem/.test(blob)
  ) {
    return 'Crise asmática';
  }
  if (/reversível|reversivel|obstrução persistente|obstrucao persistente/.test(blob)) {
    return 'Asma × DPOC — diferenciação';
  }
  if (/\basma\b/.test(blob) && /\bdpoc\b/.test(blob)) {
    return 'Asma × DPOC — diferenciação';
  }
  return DEFAULT_TOPIC;
}

function inferRespiratorioOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/98.?100|100%/.test(lower) && /saturação|saturacao|spo2|meta/.test(lower)) {
    return 'SpO₂ 98–100% não é meta universal no DPOC retentor — risco de hipercapnia.';
  }
  if (/titulad|monitor/.test(lower) === false && /alta.*fio|50%|100%.*o2|oxigênio alto/.test(lower)) {
    return 'DPOC: evitar altas FiO₂ sem titulação e monitorização de SpO₂.';
  }
  if (/substitui.*corticoide|corticoide.*somente na crise|suspender.*corticoide/.test(lower)) {
    return 'Corticoide inalatório é controlador de manutenção — não substituído pelo SABA.';
  }
  if (/restringir.*hídrica|restringir.*hidrica|reduzir secreções.*água/.test(lower)) {
    return 'Não há base para restringir hidratação na crise asmática.';
  }
  if (/resgate.*cada hora|zona verde.*resgate/.test(lower)) {
    return 'Zona verde mantém tratamento — resgate conforme sintomas ou plano amarelo/vermelho.';
  }
  if (/nebulização.*8 l|fluxo mínimo de 8/.test(lower) && /intervalo inspiratório/.test(lower) === false) {
    return 'Nebulização exige técnica e fluxo adequados — não misturar sem critério.';
  }
  if (/fio2.*empírico|desconsiderando.*saturação|sem monitor/.test(lower)) {
    return 'Oxigenoterapia exige monitorização de SpO₂ — não ajuste empírico.';
  }
  if (/inspiração rápida e forçada|inspiracao rapida e forcada/.test(lower)) {
    return 'Inalação com máscara de O₂ não exige inspiração forçada para deposição do fármaco.';
  }
  if (/água corrente.*sol|secar ao sol.*espaçador|sem detergente/.test(lower)) {
    return 'Espaçador exige higienização com detergente neutro e substituição periódica.';
  }
  if (/asma.*igual.*dpoc|dpoc.*reversível completa/.test(lower)) {
    return 'Asma é reversível; DPOC é obstrução persistente e progressiva.';
  }
  return truncate(text, 500);
}

function inferRespiratorioOptionTheme(
  text: string,
  isCorrect: boolean,
): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  if (/espaçador|espacador|inalador pressurizado/.test(lower)) {
    return {
      label: 'Espaçador + inalador',
      detail: isCorrect
        ? 'Exalar, disparar e manter apneia inspiratória — melhora deposição pulmonar.'
        : inferRespiratorioOptionTrap(text),
      icon: 'Wind',
    };
  }
  if (/spo2|saturação|saturacao|fio2|oxigênio|oxigenio/.test(lower)) {
    return {
      label: 'Oxigenoterapia',
      detail: isCorrect
        ? truncate(text, 500)
        : inferRespiratorioOptionTrap(text),
      icon: 'Gauge',
    };
  }
  if (/corticoide|salbutamol|broncodilatador/.test(lower)) {
    return {
      label: 'Medicamento inalatório',
      detail: truncate(text, 500),
      icon: 'Activity',
    };
  }
  if (/nebulização|nebulizacao/.test(lower)) {
    return {
      label: 'Nebulização',
      detail: inferRespiratorioOptionTrap(text),
      icon: 'Droplets',
    };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function buildRespiratorioGoldenRows(
  topic: string,
  _options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === 'O₂ titulado / SpO₂ alvo' || topic === 'Asma × DPOC — diferenciação') {
    return [
      { label: 'DPOC descompensada', value: 'O₂ titulado com monitorização', badge: 'ok' },
      { label: 'Asma', value: 'Obstrução reversível — broncodilatador', badge: 'ok' },
      { label: 'SpO₂ 98–100% sempre', value: 'Falso no retentor de CO₂', badge: 'warn' },
      {
        label: 'Gabarito',
        value: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }
  if (topic === 'Espaçador e inalador') {
    return [
      { label: 'Técnica', value: 'Exalar → jato → apneia inspiratória ≥10 s', badge: 'ok' },
      { label: 'Espaçador', value: 'Melhora deposição; higiene com detergente neutro', badge: 'ok' },
      { label: 'FiO₂ empírica', value: 'Monitorar SpO₂ — não desconsiderar saturação', badge: 'warn' },
      {
        label: 'Gabarito',
        value: truncate(`Letra ${correct.id}`, 500),
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }
  if (topic === 'Peak flow') {
    return [
      { label: 'Zona verde', value: '≥80% do melhor PFE — manter tratamento', badge: 'ok' },
      { label: 'Alerta', value: 'Queda >20% do melhor valor pessoal', badge: 'warn' },
      {
        label: 'Gabarito',
        value: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }
  return [];
}

function buildRespiratorioConceptItems(
  input: BuildPackageSlidesInput,
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  return [
    {
      label: 'Contexto clínico',
      detail: truncate(input.instruction.replace(/\s+/g, ' '), 500),
      icon: 'Target',
    },
    {
      label: topic,
      detail: truncate(correct.text, 500),
      icon: 'Wind',
    },
    {
      label: 'Gabarito',
      detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
      icon: 'CheckCircle',
    },
    {
      label: 'Pegadinha do tema',
      detail: truncate(inferRespiratorioOptionTrap(
        input.options.find((o) => !o.is_correct)?.text ?? '',
      ), 500),
      icon: 'AlertTriangle',
    },
  ];
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferRespiratorioCronicoTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferRespiratorioCronicoTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferRespiratorioOptionTrap,
  inferOptionTheme: inferRespiratorioOptionTheme,
  buildGoldenRows: buildRespiratorioGoldenRows,
  buildConceptItems: buildRespiratorioConceptItems,
};

export function respiratorioCronicoGoldenReferenceForInput(
  instruction: string,
  options: QuestionOption[],
  family: string,
): string {
  const topic = inferRespiratorioCronicoTopic(instruction, options);
  if (topic === 'Peak flow') return RESPIRATORIO_PEAK_FLOW_GOLDEN_FILE;
  if (topic === 'Corticoide inalatório × resgate') return RESPIRATORIO_CORTICOIDE_GOLDEN_FILE;
  if (topic === 'Crise asmática') return RESPIRATORIO_CRISE_EXCETO_GOLDEN_FILE;
  if (topic === 'Exacerbação DPOC') return RESPIRATORIO_EXACERBACAO_GOLDEN_FILE;
  if (topic === 'Espaçador e inalador') return RESPIRATORIO_ESPACADOR_GOLDEN_FILE;
  if (topic === 'O₂ titulado / SpO₂ alvo' || topic === 'Asma × DPOC — diferenciação') {
    return RESPIRATORIO_DPOC_VF_GOLDEN_FILE;
  }
  return family === 'vf' ? RESPIRATORIO_DPOC_VF_GOLDEN_FILE : RESPIRATORIO_CORTICOIDE_GOLDEN_FILE;
}

export function canBuildRespiratorioCronicoPremiumSlides(
  instruction: string,
  family: string,
): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildRespiratorioCronicoPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
