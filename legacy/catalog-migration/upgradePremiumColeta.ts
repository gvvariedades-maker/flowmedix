import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { CurativosAssertive } from '@/legacy/catalog-migration/upgradePremiumCurativos';
import {
  buildPackageSlidesForFamily,
  canBuildPackagePremiumSlides,
  type BuildPackageSlidesInput,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
  type ChoicePackageConfig,
} from '@/legacy/catalog-migration/upgradePremiumVfCore';

export const COLETA_GOLDEN_FILE = 'questao-premium-cpcon-coleta-amostras-vf.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Coleta e transporte';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'Coleta correta = sítio venoso + temperatura + segregação de resíduos.',
    goldenContent: 'COLETA E TRANSPORTE — O QUE A BANCA COBRA',
    goldenFooter: 'Na pré-analítica, a banca adora inverter venopunção, temperatura e descarte.',
    logicFooter: 'Raciocínio seguro: punção adequada + temperatura + segregação = acerto.',
    logicFix: 'se a frase fala em perfurocortante, pense em recipiente próprio e segregação.',
    dangerContent: 'PEGADINHAS — COLETA E TRANSPORTE',
    dangerFooter: (id) => `Banca costuma errar na pegadinha do descarte — gabarito ${id}.`,
    chipLabel: 'PRÉ-ANALÍTICA',
  },
  'Coleta venosa': {
    conceptFooter: 'Mediana cubital costuma ser preferida por calibre e estabilidade.',
    goldenContent: 'PUNÇÃO VENOSA — SÍTIO E TÉCNICA',
    goldenFooter: 'Cefálica pode ser usada, mas a banca cobra a veia de escolha frequente.',
    logicFooter: 'Identifique o sítio venoso antes de julgar combinações.',
    logicFix: 'mediana cubital > cefálica na coleta de rotina.',
    dangerContent: 'PEGADINHAS — COLETA VENOSA',
    dangerFooter: (id) => `Sítio venoso correto fecha letra ${id}.`,
    chipLabel: 'VENOPUNÇÃO',
  },
  'Transporte e refrigeração': {
    conceptFooter: 'Amostras refrigeradas: em regra 2°C a 8°C conforme protocolo.',
    goldenContent: 'TRANSPORTE — TEMPERATURA E PRAZO',
    goldenFooter: 'Não basta “manter frio” — a banca cobra faixa de temperatura.',
    logicFooter: 'Verifique se o exame exige refrigeração e a faixa correta.',
    logicFix: 'transporte refrigerado = 2°C a 8°C na maioria dos protocolos.',
    dangerContent: 'PEGADINHAS — TRANSPORTE DE AMOSTRAS',
    dangerFooter: (id) => `Temperatura correta fecha letra ${id}.`,
    chipLabel: 'TRANSPORTE',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isColetaSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'coleta de exames laboratoriais' ||
    n === 'coleta de exames' ||
    n === 'exames laboratoriais'
  );
}

export function inferColetaTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/refriger|2\s*°|8\s*°|transporte|acondicionamento/.test(blob)) {
    return 'Transporte e refrigeração';
  }
  if (/mediana|cefálica|cefalica|punção|puncao|sangue venoso|veia/.test(blob)) {
    return 'Coleta venosa';
  }
  return DEFAULT_TOPIC;
}

function buildColetaFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/perfurocortante|luva|gaze|descarte|resíduo|residuo/.test(lower)) {
    return {
      label: 'Juntar resíduos incompatíveis',
      detail: 'Misturar luvas, gazes e perfurocortantes parece prático, mas é erro de biossegurança.',
      correct: 'Perfurocortantes vão para recipiente próprio, com segregação correta.',
    };
  }
  if (/refriger|2\s*°|8\s*°|temperatura/.test(lower)) {
    return {
      label: 'Ignorar a faixa de 2°C a 8°C',
      detail: 'Quando o exame pede refrigeração, não basta dizer “manter frio” de modo genérico.',
      correct: 'O transporte refrigerado costuma seguir 2°C a 8°C, conforme protocolo.',
    };
  }
  if (/mediana|cefálica|cefalica/.test(lower)) {
    return {
      label: 'Substituir mediana cubital por cefálica sem critério',
      detail: 'A cefálica pode ser usada, mas a banca quer a veia mais favorecida na prática.',
      correct: 'A mediana cubital costuma ser preferida na coleta venosa periférica.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function buildColetaConceptItems(
  input: BuildPackageSlidesInput,
  assertives: CurativosAssertive[],
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const icons: Record<string, string> = {
    I: 'PackageCheck',
    II: 'Thermometer',
    III: 'ShieldCheck',
    IV: 'ClipboardList',
  };
  const items = assertives.map((a) => ({
    label: truncate(a.text.split(/[,.;]/)[0] ?? `Afirmativa ${a.roman}`, 40),
    detail: truncate(`${a.isTrue ? 'VERDADEIRA' : 'FALSA'}: ${a.text}`, 500),
    icon: icons[a.roman] ?? (a.isTrue ? 'CheckCircle' : 'XCircle'),
  }));
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'CheckCircle',
  });
  if (assertives.some((a) => !a.isTrue && /perfurocortante|descarte/.test(a.text.toLowerCase()))) {
    items.splice(items.length - 1, 0, {
      label: 'Pegadinha do descarte',
      detail: 'Perfurocortante nunca vai no mesmo recipiente que gaze ou luva.',
      icon: 'AlertTriangle',
    });
  }
  return items.slice(0, 20);
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferColetaTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildColetaFalseDanger,
  buildConceptItems: (input, assertives, correct) =>
    buildColetaConceptItems(input, assertives, correct),
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferColetaTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: (text) => {
    const lower = text.toLowerCase();
    if (/jejum|horário|horario/.test(lower)) return 'Confundir jejum ou horário de coleta sem ler o protocolo.';
    if (/tubo|anticoagulante|hemólise|hemolise/.test(lower)) {
      return 'Trocar tubo ou anticoagulante — erro pré-analítico clássico.';
    }
    return truncate(text, 500);
  },
};

export function canBuildColetaPremiumSlides(instruction: string, family: string): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildColetaPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
