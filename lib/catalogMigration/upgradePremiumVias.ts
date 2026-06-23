import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { CurativosAssertive } from '@/lib/catalogMigration/upgradePremiumCurativos';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import {
  buildPackageSlidesForFamily,
  canBuildPackagePremiumSlides,
  type BuildPackageSlidesInput,
  type SubtopicoTopicProfile,
  type VfPackageConfig,
  type ChoicePackageConfig,
} from '@/lib/catalogMigration/upgradePremiumVfCore';

export const VIAS_GOLDEN_FILE = 'questao-premium-cpcon-vias-im-vf.json';

type SlideRecord = Record<string, unknown>;

const DEFAULT_TOPIC = 'Vias de administração';

const TOPIC_PROFILES: Record<string, SubtopicoTopicProfile> = {
  [DEFAULT_TOPIC]: {
    conceptFooter: 'Via certa = absorção + técnica + sítio anatômico — não marque por intuição.',
    goldenContent: 'VIAS DE ADMINISTRAÇÃO — O QUE A BANCA COBRA',
    goldenFooter: 'A banca inverte absorção IM×SC, sítios de punção e cuidados de conforto.',
    logicFooter: 'Julgue cada afirmativa antes de montar combinações A–E.',
    logicFix: 'IM absorve mais rápido que SC — músculo é mais vascularizado.',
    dangerContent: 'PEGADINHAS — VIAS DE ADMINISTRAÇÃO',
    dangerFooter: (id) => `Confronte absorção e sítio anatômico antes de marcar ${id}.`,
    chipLabel: 'VIAS',
  },
  'Via intramuscular (IM)': {
    conceptFooter: 'IM = absorção rápida, marcos ósseos e ventroglúteo seguro em adultos.',
    goldenContent: 'VIA IM — ABSORÇÃO, SÍTIO E TÉCNICA',
    goldenFooter: 'Ventroglúteo é recomendado — banca inverte com glúteo médio/nervo ciático.',
    logicFooter: 'Absorção IM > SC; palpar músculo e marcos antes da punção.',
    logicFix: 'IM não é “mais lenta que SC” — é o oposto.',
    dangerContent: 'PEGADINHAS — INJEÇÃO INTRAMUSCULAR',
    dangerFooter: (id) => `Absorção e sítio corretos fecham letra ${id}.`,
    chipLabel: 'IM',
  },
  'Via subcutânea (SC)': {
    conceptFooter: 'SC = tecido adiposo, absorção mais lenta que IM.',
    goldenContent: 'VIA SC — ABSORÇÃO E INDICAÇÃO',
    goldenFooter: 'Não confundir SC com IM na velocidade de absorção.',
    logicFooter: 'SC para medicamentos que exigem absorção lenta e gradual.',
    logicFix: 'SC não é via de absorção rápida.',
    dangerContent: 'PEGADINHAS — VIA SUBCUTÂNEA',
    dangerFooter: (id) => `Indicação e absorção corretas fecham letra ${id}.`,
    chipLabel: 'SC',
  },
  'Via endovenosa (EV)': {
    conceptFooter: 'EV = ação imediata, risco de extravasação e compatibilidade.',
    goldenContent: 'VIA EV — VELOCIDADE E SEGURANÇA',
    goldenFooter: 'A banca testa diluição, compatibilidade e velocidade de infusão.',
    logicFooter: 'EV exige técnica asséptica e verificação de compatibilidade.',
    logicFix: 'nunca confundir EV com IM/SC na velocidade de ação.',
    dangerContent: 'PEGADINHAS — VIA ENDOVENOSA',
    dangerFooter: (id) => `Compatibilidade e técnica fecham letra ${id}.`,
    chipLabel: 'EV',
  },
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function isViasSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return n === 'vias de administração' || n === 'vias de administracao';
}

export function inferViasTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (/\bintramuscular\b|\bim\b|ventroglúteo|ventrogluteo|deltoide|glúteo|gluteo/.test(blob)) {
    return 'Via intramuscular (IM)';
  }
  if (/subcutânea|subcutanea|\bsc\b/.test(blob)) {
    return 'Via subcutânea (SC)';
  }
  if (/endovenosa|intravenosa|\bev\b|infusão|infusao/.test(blob)) {
    return 'Via endovenosa (EV)';
  }
  return DEFAULT_TOPIC;
}

function buildViasFalseDanger(a: CurativosAssertive): { label: string; detail: string; correct: string } {
  const lower = a.text.toLowerCase();
  if (/absorção|absorcao|lenta|vasculariza/.test(lower) && /músculo|musculo|subcutânea|subcutanea/.test(lower)) {
    return {
      label: 'Inverter absorção IM × SC',
      detail: 'A banca diz que IM é mais lenta ou menos vascularizada — é o oposto.',
      correct: 'IM tem absorção mais rápida que SC — músculo é mais vascularizado.',
    };
  }
  if (/ventroglúteo|ventrogluteo|glúteo médio|gluteo medio|nervo ciático|nervo ciatico/.test(lower)) {
    return {
      label: 'Desqualificar o ventroglúteo',
      detail: 'A banca apresenta ventroglúteo como “menos recomendado” por proximidade a nervos.',
      correct: 'Ventroglúteo é sítio seguro e recomendado — afastar-se de nervo ciático.',
    };
  }
  if (/palpar|marcos ósseos|marcos osseos|dor/.test(lower)) {
    return {
      label: 'Descartar cuidados de conforto como “irrelevantes”',
      detail: 'Posição, palpação e distração são cuidados reais de técnica IM.',
      correct: 'Palpar músculo, posicionar e minimizar dor fazem parte da técnica correta.',
    };
  }
  return {
    label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
    detail: truncate(a.text, 500),
    correct: truncate(`Afirmativa ${a.roman} é falsa nesta questão.`, 500),
  };
}

function buildViasConceptItems(
  _input: BuildPackageSlidesInput,
  assertives: CurativosAssertive[],
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  const icons: Record<string, string> = {
    I: 'TrendingUp',
    II: 'Bone',
    III: 'HeartHandshake',
    IV: 'Shield',
  };

  const defaultItems =
    topic === 'Via intramuscular (IM)'
      ? [
          {
            label: 'Absorção IM > SC',
            detail: 'Músculo é mais vascularizado — IM absorve mais rápido que SC.',
            icon: 'Zap',
          },
          {
            label: 'Marcos ósseos',
            detail: 'Palpar músculo e localizar marcos antes da punção IM.',
            icon: 'Bone',
          },
          {
            label: 'Ventroglúteo seguro',
            detail: 'Sítio recomendado — afasta-se do nervo ciático.',
            icon: 'Shield',
          },
        ]
      : topic === 'Via subcutânea (SC)'
        ? [
            {
              label: 'Absorção lenta',
              detail: 'SC absorve mais devagar que IM — efeito gradual.',
              icon: 'Clock',
            },
            {
              label: 'Tecido adiposo',
              detail: 'Volume pequeno, técnica de pinça, ângulo conforme protocolo.',
              icon: 'Syringe',
            },
          ]
        : topic === 'Via endovenosa (EV)'
          ? [
              {
                label: 'Ação imediata',
                detail: 'EV = efeito instantâneo na corrente sanguínea.',
                icon: 'Zap',
              },
              {
                label: 'Compatibilidade',
                detail: 'Verificar diluição, extravasação e velocidade de infusão.',
                icon: 'Droplet',
              },
            ]
          : [
              {
                label: 'Ordem de absorção',
                detail: 'IV imediata > IM rápida > SC lenta > VO variável.',
                icon: 'GitCompare',
              },
              {
                label: 'Técnica por via',
                detail: 'Cada via tem sítio, volume e velocidade próprios — não generalize.',
                icon: 'Syringe',
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

function inferViasOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/alto fluxo/.test(lower) && /cateter nasal|cna/.test(lower)) {
    return 'Cateter nasal é baixo fluxo (≈1–6 L/min), não alto fluxo.';
  }
  if (/absorção|absorcao/.test(lower) && /lenta/.test(lower)) {
    return 'IM absorve mais rápido que SC — banca inverte a velocidade.';
  }
  if (/venturi/.test(lower) && /simples|furos/.test(lower)) {
    return 'Venturi tem diluidores FiO₂ — não confundir com máscara simples.';
  }
  if (/90\s*°|ângulo|angulo/.test(lower) && /subcutânea|subcutanea/.test(lower)) {
    return 'Ângulo e profundidade variam por via — conferir técnica da via citada.';
  }
  return truncate(text, 500);
}

function buildViasAssertiveHints(
  a: CurativosAssertive,
  topic: string,
): Pick<GoldenRuleRow, 'exam_hint' | 'fixation'> {
  const lower = a.text.toLowerCase();
  if (!a.isTrue) {
    if (/absorção|absorcao/.test(lower) && /rápida|rapida|lenta/.test(lower)) {
      return {
        exam_hint:
          'Pegadinha: SC absorve mais devagar que IM — a banca inverte velocidade entre vias.',
        fixation: 'Antes de marcar, teste se a afirmativa confunde IM com SC.',
      };
    }
    if (/volume|3\s*ml|grande quantidade|dose grande/.test(lower)) {
      return {
        exam_hint: 'SC não admite volume grande nem absorção rápida — item falso na via subcutânea.',
        fixation: 'Volume máximo e velocidade de absorção são pegadinhas clássicas em SC.',
      };
    }
    if (/ventroglúteo|ventrogluteo|menos recomendado|nervo ciático|nervo ciatico/.test(lower)) {
      return {
        exam_hint: 'Ventroglúteo é sítio seguro — banca usa medo anatômico para inverter o conceito.',
        fixation: 'IM: ventroglúteo afasta o nervo ciático; não é o sítio proibido.',
      };
    }
    return {
      exam_hint: truncate(`Afirmativa ${a.roman} é falsa nesta questão de ${topic.toLowerCase()}.`, 500),
      fixation: 'Julgue o item pelo conteúdo clínico antes de olhar as letras.',
    };
  }
  if (/irritação|gordurosa|adiposo|aderência|facilitada|palpar|marcos|dor|posição/.test(lower)) {
    return {
      exam_hint: 'Item verdadeiro — técnica ou indicação real da via cobrada na prova.',
      fixation: 'Itens verdadeiros de técnica e indicação costumam compor o gabarito.',
    };
  }
  return {
    exam_hint: truncate(`Afirmativa ${a.roman} está correta para ${topic.toLowerCase()}.`, 500),
    fixation: 'Confirme no enunciado antes de montar a combinação final.',
  };
}

function buildViasChoiceGoldenRows(
  topic: string,
  options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  return options.map((opt) => {
    const trap = inferViasOptionTrap(opt.text);
    const isCorrect = opt.is_correct;
    return {
      label: `Letra ${opt.id}`,
      value: isCorrect
        ? truncate(`Verdadeira: ${opt.text}`, 500)
        : truncate(`Falsa: ${opt.text}`, 500),
      ...(isCorrect
        ? { badge: 'ok' as const, emphasis: 'highlight' as const }
        : { emphasis: 'alert' as const, badge: 'warn' as const }),
      exam_hint: isCorrect
        ? 'Combinação correta — reúne apenas afirmativas verdadeiras do enunciado.'
        : truncate(`Distrator: ${trap}`, 500),
      fixation: isCorrect
        ? 'Núcleo do gabarito — confirme julgando cada afirmativa I–IV.'
        : 'Elimine: inclui item falso ou omite verdadeiro do gabarito.',
    };
  });
}

const VF_CONFIG: VfPackageConfig = {
  inferTopic: inferViasTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  buildFalseDangerItem: buildViasFalseDanger,
  buildConceptItems: buildViasConceptItems,
  enrichVfGoldenRow: (a, _correct, topic) => buildViasAssertiveHints(a, topic),
};

const CHOICE_CONFIG: ChoicePackageConfig = {
  inferTopic: inferViasTopic,
  topicProfiles: TOPIC_PROFILES,
  defaultTopic: DEFAULT_TOPIC,
  inferOptionTrap: inferViasOptionTrap,
  buildGoldenRows: buildViasChoiceGoldenRows,
};

export function canBuildViasPremiumSlides(instruction: string, family: string): boolean {
  return canBuildPackagePremiumSlides(instruction, family);
}

export function buildViasPremiumSlidesForFamily(
  input: BuildPackageSlidesInput,
  family: string,
): SlideRecord[] {
  return buildPackageSlidesForFamily(input, family, VF_CONFIG, CHOICE_CONFIG);
}
