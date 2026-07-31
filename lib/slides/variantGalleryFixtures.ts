/**
 * Fixtures padrão e de estresse para a galeria de layoutVariant.
 * Conteúdo sintético — só para snapshot visual (não é handcraft de prova).
 */
import type { SlideTypeKey } from '@/lib/neurocanvas/declaredVariants';

export type GalleryFixtureKind = 'default' | 'stress';

export type GallerySlide = {
  type: SlideTypeKey;
  layout_variant: string;
  slide_title?: string;
  content?: string;
  footer_rule?: string;
  reveal_mode?: 'tap' | 'auto';
  bullet_style?: 'numbered' | 'x_icon';
  items?: { label: string; detail?: string; correct?: string; icon?: string }[];
  steps?: string[];
  rows?: { label: string; value: string }[];
  meta?: { topico?: string; subtopico?: string };
};

const META = {
  topico: 'Enfermagem',
  subtopico: 'Vias de Administração',
} as const;

function conceptDefault(variant: string): GallerySlide {
  return {
    type: 'concept_map',
    layout_variant: variant,
    slide_title: 'Fixture — concept_map',
    meta: { ...META },
    items: [
      { label: 'Absorção', detail: 'Velocidade depende da via.', icon: 'Zap' },
      { label: 'Técnica', detail: 'Ângulo, volume e sítio.', icon: 'Syringe' },
      { label: 'Pegadinha', detail: 'Não confundir IM com SC.', icon: 'AlertTriangle' },
      { label: 'Norma', detail: 'Seguir POP + checagem dos 9 certos.', icon: 'ShieldCheck' },
    ],
    footer_rule: 'Via → técnica → checagem',
  };
}

function conceptStress(variant: string): GallerySlide {
  return {
    type: 'concept_map',
    layout_variant: variant,
    slide_title: 'Stress — concept_map densidade máxima',
    meta: { ...META },
    items: Array.from({ length: 8 }, (_, i) => ({
      label: `Nó pedagógico ${i + 1} com rótulo longo demais para caber em uma linha sem truncar`,
      detail:
        'Texto longo de estresse: a banca mistura vias, volumes e sítios em enunciados densos. ' +
        'O layout precisa preservar hierarquia, contraste e legibilidade em 375px sem overflow horizontal.',
      icon: i % 2 === 0 ? 'Target' : 'ListChecks',
    })),
    footer_rule:
      'Footer longo de estresse — mnemônico extenso que deve permanecer legível sem empurrar o conteúdo para fora da viewport em mobile estreito.',
  };
}

function goldenDefault(variant: string): GallerySlide {
  const withRows = variant === 'reference_table' || variant.includes('board') || variant.includes('matrix') || variant.includes('rail') || variant.includes('spectrum') || variant.includes('carousel') || variant.includes('mesh') || variant.includes('lens');
  return {
    type: 'golden_rule',
    layout_variant: variant,
    slide_title: 'Fixture — golden_rule',
    meta: { ...META },
    content: 'REGRA DE OURO — VIA E VOLUME',
    rows: withRows || variant === 'reference_table'
      ? [
          { label: 'IM deltoide', value: '≤ 2 mL (adulto)' },
          { label: 'SC', value: '≤ 1 mL' },
          { label: 'ID', value: '0,1 mL' },
        ]
      : undefined,
    footer_rule: 'Decore volume por via',
  };
}

function goldenStress(variant: string): GallerySlide {
  return {
    type: 'golden_rule',
    layout_variant: variant,
    slide_title: 'Stress — golden_rule tabela densa',
    meta: { ...META },
    content:
      'REGRA EXTENSA DE ESTRESSE — PARÂMETROS NORMATIVOS COM TEXTO LONGO PARA FORÇAR QUEBRA DE LINHA E DENSIDADE',
    rows: Array.from({ length: 10 }, (_, i) => ({
      label: `Critério normativo ${i + 1} com rótulo muito longo`,
      value:
        'Valor oficial detalhado com números, unidades e exceções clínicas que a banca gosta de misturar no mesmo item da tabela.',
    })),
    footer_rule:
      'Footer de estresse: decore critérios 1–10 sem perder o fio; a tabela não pode colapsar tipografia nem esconder a última linha em 375px.',
  };
}

function logicDefault(variant: string): GallerySlide {
  return {
    type: 'logic_flow',
    layout_variant: variant,
    reveal_mode: 'tap',
    meta: { ...META },
    steps: [
      'Identificar a via pedida no enunciado.',
      'Checar volume máximo compatível.',
      'Escolher sítio anatômico correto.',
      'Eliminar alternativas com via/volume trocados.',
      'Marcar a letra do gabarito.',
    ],
    footer_rule: 'Via → volume → sítio → letra',
  };
}

function logicStress(variant: string): GallerySlide {
  return {
    type: 'logic_flow',
    layout_variant: variant,
    reveal_mode: 'tap',
    meta: { ...META },
    steps: Array.from({ length: 12 }, (_, i) =>
      `Passo ${i + 1}: decisão longa de eliminação com vocabulário clínico denso — ` +
        'verificar se o trilho/tap preserva ordem, foco e contraste sem cortar o texto no mobile.',
    ),
    footer_rule:
      'Footer longo: roteiro completo de eliminação deve permanecer ancorado sem competir com os passos revelados.',
  };
}

function dangerDefault(variant: string): GallerySlide {
  const compareLike =
    variant === 'compare' ||
    variant.includes('trap') ||
    variant.includes('arena') ||
    variant.includes('mismatch') ||
    variant.includes('reveal') ||
    variant.includes('chips') ||
    variant.includes('gate');
  return {
    type: 'danger_zone',
    layout_variant: variant,
    bullet_style: 'x_icon',
    meta: { ...META },
    content: 'PEGADINHAS — vias e volumes',
    items: [
      {
        label: 'Letra A — IM com 5 mL no deltoide',
        detail: 'Parece prático em emergência.',
        correct: compareLike
          ? 'Deltoide adulto: volume típico ≤ 2 mL; 5 mL exige outro sítio/via.'
          : undefined,
      },
      {
        label: 'Letra C — SC com agulha 40×12',
        detail: 'Confunde com IM.',
        correct: compareLike
          ? 'SC usa agulha curta; 40×12 é perfil de IM.'
          : undefined,
      },
      {
        label: 'Trocar ID por SC',
        detail: 'Mesmo “intradérmico/ subcutâneo” no enunciado.',
        correct: compareLike ? 'ID ≈ 0,1 mL; SC até ~1 mL — técnicas distintas.' : undefined,
      },
    ],
    footer_rule: 'Volume e agulha denunciam a via',
  };
}

function dangerStress(variant: string): GallerySlide {
  return {
    type: 'danger_zone',
    layout_variant: variant,
    bullet_style: 'x_icon',
    meta: { ...META },
    content:
      'PEGADINHAS DE ESTRESSE — DENSIDADE MÁXIMA COM JUSTIFICATIVAS LONGAS PARA CADA DISTRATOR',
    items: Array.from({ length: 8 }, (_, i) => ({
      label: `Distrator ${String.fromCharCode(65 + i)} — enunciado longo que mistura via, volume e sítio`,
      detail:
        'Por que parece correta: a banca cola conduta vizinha e troca só um parâmetro crítico no meio do texto.',
      correct:
        'Por que erra + fato normativo longo o bastante para forçar o layout compare/arena a quebrar linha sem perder o contraste pegadinha × correto em 375px.',
    })),
    footer_rule:
      'Footer de estresse: cada card precisa justificar a própria letra — sem reciclar a mesma frase.',
  };
}

export function buildGallerySlide(
  slideType: SlideTypeKey,
  variant: string,
  fixture: GalleryFixtureKind,
): GallerySlide {
  if (slideType === 'concept_map') {
    return fixture === 'stress' ? conceptStress(variant) : conceptDefault(variant);
  }
  if (slideType === 'golden_rule') {
    return fixture === 'stress' ? goldenStress(variant) : goldenDefault(variant);
  }
  if (slideType === 'logic_flow') {
    return fixture === 'stress' ? logicStress(variant) : logicDefault(variant);
  }
  return fixture === 'stress' ? dangerStress(variant) : dangerDefault(variant);
}

export function galleryQuestionMeta() {
  return {
    banca: 'AVANT',
    topico: META.topico,
    subtopico: META.subtopico,
    ano: '2026',
    cargo_header: 'TÉCNICO DE ENFERMAGEM',
  };
}
