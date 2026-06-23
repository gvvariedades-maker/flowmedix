import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import type { CurativosAssertive } from '@/lib/catalogMigration/upgradePremiumCurativos';
import {
  buildPackageSlidesForFamily,
  canBuildPackagePremiumSlides,
  type BuildPackageSlidesInput,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
  type ChoicePackageConfig,
} from '@/lib/catalogMigration/upgradePremiumVfCore';

export const URGENCIAS_GOLDEN_FILE = 'questao-premium-urgencias-rcp.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Urgências e emergências';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'Urgência = reconhecer risco + protocolo + segurança da cena.',
    goldenContent: 'URGÊNCIA — O QUE A BANCA COBRA',
    goldenFooter: 'A banca troca sequência, proporção e frequência de checagens.',
    logicFooter: 'Siga o protocolo antes de marcar por intuição clínica.',
    logicFix: 'protocolo de prova vence “parece correto” em urgência.',
    dangerContent: 'PEGADINHAS — URGÊNCIAS',
    dangerFooter: (id) => `Protocolo correto fecha letra ${id}.`,
    chipLabel: 'URGÊNCIA',
  },
  'RCP / Suporte Básico de Vida': {
    conceptFooter: 'RCP = compressões de qualidade + ventilação 30:2 + DEA precoce.',
    goldenContent: 'RCP ADULTO — LEMBRETE DE PROVA',
    goldenFooter: 'Qualidade da compressão salva mais que pausas frequentes para pulso.',
    logicFooter: 'Segurança → responsividade → compressões → ventilação → DEA.',
    logicFix: 'pulso não é checado a cada ciclo na RCP de adulto.',
    dangerContent: 'PEGADINHAS EM RCP — O QUE A BANCA TROCA',
    dangerFooter: (id) => `III costuma errar pulso a cada ciclo — gabarito ${id}.`,
    chipLabel: 'RCP',
  },
  'Trauma e vias aéreas': {
    conceptFooter: 'Trauma = imobilização cervical + jaw-thrust quando indicado.',
    goldenContent: 'TRAUMA — VIA AÉREA E IMOBILIZAÇÃO',
    goldenFooter: 'A banca testa jaw-thrust vs head-tilt em suspeita cervical.',
    logicFooter: 'Suspeita de trauma cervical → evitar hiperextensão.',
    logicFix: 'jaw-thrust preserva coluna em trauma.',
    dangerContent: 'PEGADINHAS — TRAUMA',
    dangerFooter: (id) => `Técnica de via aérea correta fecha letra ${id}.`,
    chipLabel: 'TRAUMA',
  },
  'Hemorragia e choque': {
    conceptFooter: 'Choque = reconhecer sinais + posicionar + controlar sangramento.',
    goldenContent: 'CHOQUE — RECONHECIMENTO E CONDUTA',
    goldenFooter: 'A banca confunde tipos de choque e posicionamento.',
    logicFooter: 'Identifique choque antes de escolher fluido ou droga.',
    logicFix: 'controle de sangramento e oxigenação vêm antes de detalhes.',
    dangerContent: 'PEGADINHAS — CHOQUE',
    dangerFooter: (id) => `Conduta de choque correta fecha letra ${id}.`,
    chipLabel: 'CHOQUE',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isUrgenciasSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'urgências e emergências' ||
    n === 'urgência e emergência' ||
    n === 'urgências' ||
    n === 'emergência' ||
    n === 'urgência'
  );
}

export function inferUrgenciasTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/rcp|reanimação|reanimacao|compressão|compressao|sbv|suporte básico|suporte basico|dea|desfibril/.test(blob)) {
    return 'RCP / Suporte Básico de Vida';
  }
  if (/trauma|cervical|jaw.?thrust|imobiliza|via aérea|via aerea/.test(blob)) {
    return 'Trauma e vias aéreas';
  }
  if (/hemorragia|sangramento|choque|hipotens/.test(blob)) {
    return 'Hemorragia e choque';
  }
  return DEFAULT_TOPIC;
}

function buildUrgenciasFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/pulso/.test(lower) && (/ciclo|cada|antes de retomar/.test(lower))) {
    return {
      label: 'Verificar pulso a cada ciclo',
      detail: 'Parar compressões com frequência para checar pulso entre ciclos.',
      correct: 'Não interromper por pulso: verificar só após ~2 minutos de RCP contínua.',
    };
  }
  if (/30:2|30\s*:\s*2|ventilação|ventilacao/.test(lower) && /errad|incorret|diferente/.test(lower)) {
    return {
      label: 'Trocar proporção 30:2',
      detail: 'A banca altera a proporção compressão:ventilação com dois socorristas.',
      correct: 'Com dois socorristas treinados: 30 compressões para 2 ventilações.',
    };
  }
  if (/dea|desfibril/.test(lower) && /adiar|depois|terminar/.test(lower)) {
    return {
      label: 'Atrasar o DEA para “terminar” compressões',
      detail: 'Adiar o desfibrilador até concluir vários ciclos manuais.',
      correct: 'Ligar e usar o DEA assim que chegar, minimizando pausas nas compressões.',
    };
  }
  if (/hiperventil|muitas ventilações/.test(lower)) {
    return {
      label: 'Hiperventilar durante as pausas',
      detail: 'Dar muitas ventilações rápidas entre as compressões.',
      correct: 'Manter 30:2 e ventilações suficientes, sem excesso de volume/frequência.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function buildUrgenciasGoldenRows(
  topic: string,
  _options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === 'RCP / Suporte Básico de Vida') {
    return [
      { label: 'Proporção (2 socorristas)', value: '30 compressões : 2 ventilações' },
      { label: 'Frequência', value: '100–120 compressões/min' },
      { label: 'Profundidade', value: '5–6 cm' },
      { label: 'Verificar pulso', value: 'Só após ~2 min de RCP (não a cada ciclo)' },
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

function buildUrgenciasConceptItems(
  _input: BuildPackageSlidesInput,
  assertives: CurativosAssertive[],
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  if (topic === 'RCP / Suporte Básico de Vida' && assertives.length >= 2) {
    return [
      {
        label: 'Cadeia de sobrevivência',
        detail: 'Reconhecimento precoce, acionamento do serviço de emergência, RCP imediata e DEA quando disponível.',
        icon: 'HeartPulse',
      },
      {
        label: 'Compressões de qualidade',
        detail: 'Frequência 100–120/min, profundidade 5–6 cm, retorno completo do tórax, mínima interrupção.',
        icon: 'Activity',
      },
      {
        label: 'Ventilação',
        detail: '30 compressões : 2 ventilações com dois socorristas; evitar hiperventilação.',
        icon: 'Wind',
      },
      {
        label: 'Gabarito',
        detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        icon: 'Target',
      },
    ];
  }
  return assertives
    .map((a) => ({
      label: `Afirmativa ${a.roman}`,
      detail: truncate(`${a.isTrue ? 'VERDADEIRA' : 'FALSA'}: ${a.text}`, 500),
      icon: a.isTrue ? 'CheckCircle' : 'XCircle',
    }))
    .concat([
      {
        label: 'Gabarito',
        detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
        icon: 'Target',
      },
    ])
    .slice(0, 20);
}

function inferUrgenciasOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/pulso/.test(lower) && /ciclo/.test(lower)) {
    return 'Pulso não é verificado a cada ciclo na RCP de adulto.';
  }
  if (/15:2/.test(lower)) return 'Proporção adulto com 2 socorristas é 30:2, não 15:2.';
  if (/dea/.test(lower) && /depois|adiar/.test(lower)) {
    return 'DEA deve ser usado assim que disponível.';
  }
  return truncate(text, 500);
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferUrgenciasTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildUrgenciasFalseDanger,
  buildConceptItems: buildUrgenciasConceptItems,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferUrgenciasTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferUrgenciasOptionTrap,
  buildGoldenRows: buildUrgenciasGoldenRows,
};

export function canBuildUrgenciasPremiumSlides(instruction: string, family: string): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildUrgenciasPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
