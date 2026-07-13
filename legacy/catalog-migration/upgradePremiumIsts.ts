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

export const ISTS_GOLDEN_FILE = 'questao-premium-cpcon-ists-risco-transmissao-vf.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Fatores de risco de IST';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'IST na prova = sexual desprotegido + parceria de risco + compartilhamento de agulhas.',
    goldenContent: 'ROTAS DE RISCO — O QUE A BANCA COBRA',
    goldenFooter: 'A banca adora incluir afirmativa quase certa sobre droga injetável para induzir marcar III.',
    logicFooter: 'Raciocínio seguro: sexual desprotegido + parceria de risco = acerto sem a III.',
    logicFix: 'em IST, parenteral na prova quase sempre significa compartilhamento de material perfurocortante.',
    dangerContent: 'PEGADINHAS — RISCO DE IST',
    dangerFooter: (id) => `Banca costuma errar na III — gabarito ${id}.`,
    chipLabel: 'IST',
  },
  'Prevenção e profilaxia': {
    conceptFooter: 'Preservativo + testagem + PEP/PrEP quando indicado.',
    goldenContent: 'PREVENÇÃO DE IST — BARREIRAS E CONDUTAS',
    goldenFooter: 'A banca confunde profilaxia pós-exposição com tratamento curativo.',
    logicFooter: 'Identifique barreira mecânica, química ou comportamental antes de marcar.',
    logicFix: 'camisinha é barreira central na prevenção sexual de IST.',
    dangerContent: 'PEGADINHAS — PREVENÇÃO DE IST',
    dangerFooter: (id) => `Profilaxia correta fecha letra ${id}.`,
    chipLabel: 'PREVENÇÃO',
  },
  'Agentes e manifestações': {
    conceptFooter: 'HIV, sífilis, hepatites, HPV — cada agente tem via e conduta própria.',
    goldenContent: 'IST — AGENTES COBRADOS EM PROVA',
    goldenFooter: 'Não tratar toda IST como HIV — leia o agente do enunciado.',
    logicFooter: 'Via de transmissão + período de incubação + notificação.',
    logicFix: 'sífilis e hepatites entram no mesmo mapa de vigilância que HIV.',
    dangerContent: 'PEGADINHAS — AGENTES DE IST',
    dangerFooter: (id) => `Agente e conduta corretos fecham letra ${id}.`,
    chipLabel: 'AGENTES',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isIstsSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'infecções sexualmente transmissíveis (ists)' ||
    n === 'infecções sexualmente transmissíveis' ||
    n === 'ists'
  );
}

export function inferIstsTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/profilax|pep\b|prep\b|preservativo|camisinha|prevenção|prevencao/.test(blob)) {
    return 'Prevenção e profilaxia';
  }
  if (/hiv|sífilis|sifilis|hepatite|hpv|gonorreia|clamídia|clamidia|herpes/.test(blob)) {
    return 'Agentes e manifestações';
  }
  return DEFAULT_TOPIC;
}

function buildIstsFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/uso pessoal|exclusivamente pessoal|agulha pessoal/.test(lower)) {
    return {
      label: 'Marcar III por falar em droga injetável com uso pessoal',
      detail: 'A frase cita uso pessoal — o risco parenteral exige compartilhamento de agulha ou seringa.',
      correct: 'Agulha de uso exclusivamente pessoal não entra como fator de risco nesta assertiva.',
    };
  }
  if (/camisinha|preservativo|sexo sem/.test(lower) && !a.isTrue) {
    return {
      label: 'Descartar relação sexual desprotegida',
      detail: 'Sexo sem barreira é fator clássico de risco de IST.',
      correct: 'Relação sexual sem preservativo aumenta o risco de IST.',
    };
  }
  if (/parceiro|companheir|terceiros/.test(lower) && !a.isTrue) {
    return {
      label: 'Ignorar o risco do parceiro com terceiros',
      detail: 'Exposição indireta via parceria também conta.',
      correct: 'Parceiro com relações desprotegidas com outras pessoas aumenta o risco.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function buildIstsConceptItems(
  _input: BuildPackageSlidesInput,
  assertives: CurativosAssertive[],
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const icons: Record<string, string> = {
    I: 'HeartPulse',
    II: 'Users',
    III: 'Syringe',
    IV: 'Shield',
  };
  const items = [
    {
      label: 'Via sexual',
      detail: 'Relação desprotegida aumenta o risco — camisinha é barreira central.',
      icon: 'HeartPulse',
    },
    {
      label: 'Parceria de risco',
      detail: 'Parceiro com relações desprotegidas com terceiros também eleva o risco.',
      icon: 'Users',
    },
    {
      label: 'Via parenteral',
      detail: 'Risco vem do compartilhamento de seringas e agulhas — não do uso exclusivamente pessoal.',
      icon: 'Syringe',
    },
    ...assertives.map((a) => ({
      label: `Afirmativa ${a.roman}`,
      detail: truncate(`${a.isTrue ? 'VERDADEIRA' : 'FALSA'}: ${a.text}`, 500),
      icon: icons[a.roman] ?? (a.isTrue ? 'CheckCircle' : 'XCircle'),
    })),
    {
      label: 'Gabarito',
      detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
      icon: 'Target',
    },
  ];
  return items.slice(0, 20);
}

function inferIstsOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/hiv/.test(lower) && /única|unica|somente/.test(lower)) {
    return 'IST não se resume a HIV — leia o escopo do enunciado.';
  }
  if (/cura|curar/.test(lower) && /ist|dst/.test(lower)) {
    return 'Profilaxia e tratamento não são sinônimos de cura em todas as IST.';
  }
  if (/compartilh/.test(lower) && /seringa|agulha/.test(lower) === false) {
    return 'Risco parenteral exige compartilhamento de material perfurocortante.';
  }
  return truncate(text, 500);
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferIstsTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildIstsFalseDanger,
  buildConceptItems: buildIstsConceptItems,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferIstsTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferIstsOptionTrap,
};

export function canBuildIstsPremiumSlides(instruction: string, family: string): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildIstsPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
