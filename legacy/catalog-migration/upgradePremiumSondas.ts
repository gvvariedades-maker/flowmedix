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

export const SONDAS_GOLDEN_FILE = 'questao-premium-consulplan-sondagem-nasogastrica-nex.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Sondagem gástrica e enteral';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'I e II corretas · III errada — confirmação isolada por ausculta nunca é padrão-ouro.',
    goldenContent: 'SONDAGEM NASOGÁSTRICA — LEMBRETE DE PROVA',
    goldenFooter: 'Mnemônico NEX: Nariz–Orelha–Xifoide — e confirmação definitiva é radiográfica.',
    logicFooter: 'Estratégia V/F: avaliar item a item → montar combinação → conferir letra.',
    logicFix: 'em sondas, todo método de confirmação descrito como isolado ou exclusivo por ausculta está errado.',
    dangerContent: 'PEGADINHAS — SONDAGEM NASOGÁSTRICA',
    dangerFooter: (id) =>
      `Confirmação isolada por ausculta e balão em SNG são erros recorrentes — gabarito ${id}.`,
    chipLabel: 'SONDAS',
  },
  'Sondagem vesical': {
    conceptFooter: 'Técnica estéril rigorosa — balão insuflado apenas após retorno de urina na sonda.',
    goldenContent: 'SONDAGEM VESICAL — REGRAS DE OURO',
    goldenFooter: 'Sonda de Foley (demora) exige balão; sonda de Nelaton (alívio) não tem balão.',
    logicFooter: 'SVD exige sistema fechado e bolsa coletora sempre abaixo do nível da bexiga.',
    logicFix: 'infecção urinária (ITU) é a complicação mais frequente e grave da sondagem vesical.',
    dangerContent: 'PEGADINHAS — SONDAGEM VESICAL',
    dangerFooter: (id) =>
      `Insuflar balão antes do retorno de urina ou elevar bolsa coletora são erros comuns — gabarito ${id}.`,
    chipLabel: 'VESICAL',
  },
  'Cuidados e complicações': {
    conceptFooter: 'Manejo seguro — lavar sonda após uso, fixar sem tração e monitorar refluxo.',
    goldenContent: 'MANEJO DE SONDAS — CUIDADOS ESSENCIAIS',
    goldenFooter: 'Obstrução e tração acidental são evitadas com lavagem rotineira e fixação adequada.',
    logicFooter: 'Sempre clampar a sonda antes de desconectar ou manipular o sistema.',
    logicFix: 'lavar a sonda com água destilada ou soro após dietas e medicações previne obstrução.',
    dangerContent: 'PEGADINHAS — CUIDADOS COM SONDAS',
    dangerFooter: (id) =>
      `Deixar de lavar a sonda ou fixar com tração excessiva anula a questão — gabarito ${id}.`,
    chipLabel: 'MANEJO',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isSondasSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'instalação e manejo de sondas' ||
    n === 'sondas' ||
    n === 'sondagem' ||
    n === 'sondagem nasogastrica' ||
    n === 'sondagem nasogástrica' ||
    n === 'sondagem vesical'
  );
}

export function inferSondasTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/vesical|foley|nelaton|bexiga|urina|svd\b|sonda vesical/.test(blob)) {
    return 'Sondagem vesical';
  }
  if (/obstru|obstrução|obstrucao|lavar|lavagem|fixa|fixação|fixacao|tração|tracao|clampar|refluxo/.test(blob)) {
    return 'Cuidados e complicações';
  }
  return DEFAULT_TOPIC;
}

function buildSondasFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/ausculta|auscultar/.test(lower)) {
    return {
      label: 'Considerar ausculta epigástrica como confirmação definitiva',
      detail: 'A ausculta epigástrica isolada não é método seguro para confirmar posicionamento gástrico.',
      correct: 'O padrão-ouro de confirmação é a radiografia de abdome.',
    };
  }
  if (/bal[aã]o/.test(lower) && /nasog[aá]strica|sng|nasoenteral/.test(lower)) {
    return {
      label: 'Insuflar balão em sonda nasogástrica (SNG)',
      detail: 'SNG (como Levine) não possui balão insuflável; isso é exclusivo de sondas vesicais.',
      correct: 'SNG não tem balão; balão é característica de sondas de Foley (vesical).',
    };
  }
  if (/fowler|elevado|cabeceira/.test(lower) && !a.isTrue) {
    return {
      label: 'Admitir decúbito plano durante a sondagem',
      detail: 'Passar sonda com paciente deitado aumenta drasticamente o risco de broncoaspiração.',
      correct: 'A posição de Fowler (45–90°) protege a via aérea durante a introdução.',
    };
  }
  if (/tosse|cianose|dispneia/.test(lower) && !a.isTrue) {
    return {
      label: 'Progredir sonda sob sinais de desconforto respiratório',
      detail: 'Tosse ou cianose indicam que a sonda pode ter entrado na via aérea.',
      correct: 'Sinais respiratórios exigem recuar imediatamente a sonda.',
    };
  }
  if (/nex|xifoide|orelha/.test(lower) && !a.isTrue) {
    return {
      label: 'Inverter a medida NEX do comprimento da sonda',
      detail: 'Trocar a ordem ou omitir o lóbulo da orelha na medida do comprimento.',
      correct: 'Sempre nariz → lóbulo da orelha → apêndice xifoide.',
    };
  }
  if (/bal[aã]o/.test(lower) && /vesical|foley|urina/.test(lower) && !a.isTrue) {
    return {
      label: 'Insuflar balão antes do retorno de urina',
      detail: 'O balão de retenção só deve ser insuflado após confirmar que a sonda está na bexiga.',
      correct: 'Aguardar retorno de urina antes de insuflar o balão da sonda vesical.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function buildSondasConceptItems(
  _input: BuildPackageSlidesInput,
  assertives: CurativosAssertive[],
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  const icons: Record<string, string> = {
    I: 'Ruler',
    II: 'Bed',
    III: 'FileCheck2',
    IV: 'Stethoscope',
  };

  const defaultItems =
    topic === 'Sondagem vesical'
      ? [
          {
            label: 'Técnica estéril',
            detail: 'Sondagem vesical exige assepsia rigorosa para evitar infecção do trato urinário.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Retorno de urina',
            detail: 'O balão de retenção só deve ser insuflado após visualizar o retorno de urina na sonda.',
            icon: 'Droplet',
          },
          {
            label: 'Coletor abaixo',
            detail: 'A bolsa coletora deve permanecer sempre abaixo do nível da bexiga para evitar refluxo.',
            icon: 'ArrowDown',
          },
        ]
      : topic === 'Cuidados e complicações'
        ? [
            {
              label: 'Lavagem da sonda',
              detail: 'Lavar com água destilada ou soro após dietas e medicações previne obstrução.',
              icon: 'Droplets',
            },
            {
              label: 'Fixação segura',
              detail: 'Fixar a sonda sem tração excessiva evita lesão e deslocamento.',
              icon: 'Pin',
            },
            {
              label: 'Clampar antes de manipular',
              detail: 'Sempre clampar a sonda antes de desconectar ou manipular o sistema.',
              icon: 'CircleSlash',
            },
          ]
        : [
            {
              label: 'Medida NEX',
              detail: 'Nariz → lóbulo da orelha → apêndice xifoide. Método padrão para estimar comprimento.',
              icon: 'Ruler',
            },
            {
              label: 'Posição Fowler',
              detail: 'Cabeceira elevada 45 a 90 graus facilita a progressão e protege a via aérea.',
              icon: 'Bed',
            },
            {
              label: 'Confirmação',
              detail: 'Padrão-ouro é radiografia. Ausculta epigástrica isolada não confirma posicionamento.',
              icon: 'FileCheck2',
            },
          ];

  const items = [
    ...defaultItems,
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

function inferSondasOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/ausculta/.test(lower) && /confirmar|padr[aã]o|padrao/.test(lower)) {
    return 'A ausculta epigástrica isolada nunca é o padrão-ouro de confirmação.';
  }
  if (/bal[aã]o/.test(lower) && /nasog[aá]strica|sng/.test(lower)) {
    return 'Sondas nasogástricas não possuem balão de retenção.';
  }
  if (/fowler|elevado/.test(lower) && /contraindicado|evitar|plano/.test(lower)) {
    return 'A posição de Fowler é a conduta padrão recomendada, não contraindicada.';
  }
  if (/bal[aã]o/.test(lower) && /vesical|foley/.test(lower)) {
    return 'Insuflar balão antes do retorno de urina é erro clássico em sondagem vesical.';
  }
  return truncate(text, 500);
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferSondasTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildSondasFalseDanger,
  buildConceptItems: buildSondasConceptItems,
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferSondasTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferSondasOptionTrap,
};

export function canBuildSondasPremiumSlides(instruction: string, family: string): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildSondasPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
