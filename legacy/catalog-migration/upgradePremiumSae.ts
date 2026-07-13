import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import type { CurativosAssertive } from '@/legacy/catalog-migration/upgradePremiumCurativos';
import {
  buildPackageSlidesForFamily,
  canBuildPackagePremiumSlides,
  type BuildPackageSlidesInput,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
  type ChoicePackageConfig,
} from '@/legacy/catalog-migration/upgradePremiumVfCore';

export const SAE_GOLDEN_FILE = 'questao-premium-fepese-anotacao-enfermagem-sae.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'SAE e registros';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'Em concurso: privativa do enfermeiro na SAE vale mais que achismo sobre quem anota.',
    goldenContent: 'SAE — QUEM REGISTRA O QUÊ',
    goldenFooter: 'A banca mistura ética, privativas SAE e pegadinhas de prontuário.',
    logicFooter: 'Teste identificação · integridade · acesso · veracidade → privativa SAE.',
    logicFix: 'diagnóstico e evolução de enfermagem são privativos do enfermeiro.',
    dangerContent: 'PEGADINHAS — PROCESSO DE ENFERMAGEM',
    dangerFooter: (id) => `Atribuição legal correta fecha letra ${id}.`,
    chipLabel: 'SAE',
  },
  'Anotação de enfermagem': {
    conceptFooter: 'Anotação = registro das ações da equipe — não confundir com diagnóstico.',
    goldenContent: 'ANOTAÇÃO — REGISTRO DAS AÇÕES EXECUTADAS',
    goldenFooter: 'Técnico registra o que executou; enfermeiro registra diagnóstico e evolução.',
    logicFooter: 'Separar camadas: ações (equipe) × diagnóstico/evolução (enfermeiro).',
    logicFix: 'anotação não é privativa do enfermeiro — diagnóstico sim.',
    dangerContent: 'PEGADINHAS — ANOTAÇÃO DE ENFERMAGEM',
    dangerFooter: (id) => `Registro correto fecha letra ${id}.`,
    chipLabel: 'ANOTAÇÃO',
  },
  'Diagnóstico NANDA': {
    conceptFooter: 'Diagnóstico de enfermagem = julgamento clínico privativo do enfermeiro.',
    goldenContent: 'NANDA — DIAGNÓSTICO DE ENFERMAGEM',
    goldenFooter: 'Técnico não formula diagnóstico — participa da execução do plano.',
    logicFooter: 'Etiologia + sinais/sintomas → diagnóstico → intervenções.',
    logicFix: 'diagnóstico NANDA não é atribuição do técnico.',
    dangerContent: 'PEGADINHAS — DIAGNÓSTICO NANDA',
    dangerFooter: (id) => `Diagnóstico correto fecha letra ${id}.`,
    chipLabel: 'NANDA',
  },
  'Etapas do Processo de Enfermagem': {
    conceptFooter: 'Coleta → diagnóstico → planejamento → implementação → avaliação.',
    goldenContent: 'ETAPAS DO PE — SEQUÊNCIA COFEN',
    goldenFooter: 'A banca troca ordem das etapas ou confunde planejamento com execução.',
    logicFooter: 'Diagnóstico precede planejamento; avaliação fecha o ciclo.',
    logicFix: 'não planejar antes de diagnosticar.',
    dangerContent: 'PEGADINHAS — ETAPAS DO PE',
    dangerFooter: (id) => `Sequência correta fecha letra ${id}.`,
    chipLabel: 'PE',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isSaeSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'processo de enfermagem' || n === 'sae';
}

export function inferSaeTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/anotação|anotacao|registro.*ações|registro.*acoes|prontuário|prontuario/.test(blob)) {
    return 'Anotação de enfermagem';
  }
  if (/nanda|diagnóstico de enfermagem|diagnostico de enfermagem/.test(blob)) {
    return 'Diagnóstico NANDA';
  }
  if (/etapa|planejamento|implementação|implementacao|avaliação|avaliacao|coleta de dados/.test(blob)) {
    return 'Etapas do Processo de Enfermagem';
  }
  return DEFAULT_TOPIC;
}

function inferSaeOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/facultativo/.test(lower) && /carimbo|assinatura|nome/.test(lower)) {
    return 'Identificação profissional é obrigatória — não facultativa.';
  }
  if (/lápis|lapis|rasura/.test(lower)) {
    return 'Registro deve ser permanente, legível e sem rasura indevida.';
  }
  if (/privativo.*médico|privativo.*medico/.test(lower) && /prontuário|prontuario/.test(lower)) {
    return 'Prontuário é compartilhado — equipe de enfermagem registra cuidados executados.';
  }
  if (/não executado|nao executado|outro profissional registre/.test(lower)) {
    return 'É vedado registrar cuidado não realizado ou em nome de outro.';
  }
  if (/técnico.*diagnóstico|tecnico.*diagnostico/.test(lower)) {
    return 'Diagnóstico de enfermagem é privativo do enfermeiro.';
  }
  return truncate(text, 500);
}

function inferSaeOptionTheme(
  text: string,
  isCorrect: boolean,
): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  if (/privativo.*enfermeiro|diagnóstico de enfermagem|diagnostico de enfermagem|evolução|evolucao/.test(lower)) {
    return {
      label: 'Privativa do enfermeiro',
      detail: isCorrect
        ? 'Diagnóstico e evolução de enfermagem são privativos do enfermeiro.'
        : inferSaeOptionTrap(text),
      icon: 'UserCheck',
    };
  }
  if (/carimbo|assinatura|nome legível|nome legivel/.test(lower)) {
    return {
      label: 'Identificação profissional',
      detail: isCorrect
        ? 'Carimbo, nome e assinatura são obrigatórios no registro.'
        : inferSaeOptionTrap(text),
      icon: 'Stamp',
    };
  }
  if (/lápis|lapis|rasura/.test(lower)) {
    return {
      label: 'Integridade do registro',
      detail: inferSaeOptionTrap(text),
      icon: 'ShieldCheck',
    };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function buildSaeGoldenRows(
  topic: string,
  options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === 'Anotação de enfermagem' || topic === DEFAULT_TOPIC) {
    return [
      {
        label: 'Anotação',
        value: 'Registro das ações executadas pela equipe de enfermagem',
        badge: 'info',
      },
      {
        label: 'Privativa do enfermeiro',
        value: 'Diagnóstico de enfermagem e evolução/avaliação de enfermagem',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Identificação',
        value: 'Carimbo, nome legível e assinatura — obrigatórios',
        badge: 'ok',
      },
      {
        label: 'Gabarito',
        value: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }
  return options.map((opt) => ({
    label: `Letra ${opt.id}`,
    value: opt.is_correct
      ? truncate(`Verdadeira: ${opt.text}`, 500)
      : truncate(`Falsa: ${inferSaeOptionTrap(opt.text)}`, 500),
    ...(opt.is_correct
      ? { badge: 'ok' as const, emphasis: 'highlight' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));
}

function buildSaeConceptItems(
  input: BuildPackageSlidesInput,
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  if (topic === 'Anotação de enfermagem' || topic === DEFAULT_TOPIC) {
    return [
      {
        label: 'Anotação de enfermagem',
        detail: 'Registro das ações executadas pela equipe — integra o prontuário.',
        icon: 'FileText',
      },
      {
        label: 'Privativo do enfermeiro',
        detail: 'Diagnóstico e evolução de enfermagem são privativos do enfermeiro.',
        icon: 'UserCheck',
      },
      {
        label: 'Resolução COFEN 358/2009',
        detail: 'Norma central do registro de enfermagem no Brasil.',
        icon: 'Scale',
      },
      {
        label: 'Gabarito',
        detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        icon: 'Target',
      },
    ];
  }
  return [
    { label: 'Contexto', detail: truncate(input.instruction.replace(/\s+/g, ' '), 500), icon: 'ClipboardList' },
    { label: 'Gabarito', detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500), icon: 'Target' },
  ];
}

function buildSaeFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/técnico.*diagnóstico|tecnico.*diagnostico/.test(lower)) {
    return {
      label: 'Atribuir diagnóstico ao técnico',
      detail: 'Diagnóstico de enfermagem é privativo do enfermeiro.',
      correct: 'Técnico registra ações executadas, não formula diagnóstico NANDA.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferSaeTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildSaeFalseDanger,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferSaeTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferSaeOptionTrap,
  inferOptionTheme: inferSaeOptionTheme,
  buildGoldenRows: buildSaeGoldenRows,
  buildConceptItems: buildSaeConceptItems,
};

export function canBuildSaePremiumSlides(instruction: string, family: string): boolean {
  const lower = instruction.toLowerCase();
  if (
    /processo de enfermagem|sae|nanda|anotação|anotacao|diagnóstico de enfermagem|diagnostico de enfermagem|evolução de enfermagem|evolucao de enfermagem/.test(
      lower,
    )
  ) {
    return canBuildPackagePremiumSlides(instruction, family);
  }
  return ['text_fragment', 'conceito', 'legis', 'protocolo'].includes(family);
}

export function buildSaePremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
