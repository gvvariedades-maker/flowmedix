import { landingDemoQuestao } from '@/lib/landingDemoQuestao';
import type { ReverseStudySlide } from '@/types/lesson';

export const LANDING_NEUROSLIDE_SLUG = landingDemoQuestao.modulo_slug ?? 'demo-landing-gluconato';

export const LANDING_NEUROSLIDE_SLIDES: ReverseStudySlide[] =
  landingDemoQuestao.reverse_study_slides ?? [];

export type LandingNeuroslideTypeMeta = {
  label: string;
  color: string;
  description: string;
  badgeColor: string;
};

const TYPE_META: Record<string, LandingNeuroslideTypeMeta> = {
  concept_map: {
    label: 'Mapa Mental',
    color: '#00f2ff',
    description: 'Conecta volume, concentração e proporção na diluição',
    badgeColor: 'bg-cyan-400/20 text-cyan-300',
  },
  golden_rule: {
    label: 'Regra de Ouro',
    color: '#00ff88',
    description: 'Tabela de referência com a conta da banca passo a passo',
    badgeColor: 'bg-emerald-400/20 text-emerald-300',
  },
  logic_flow: {
    label: 'Fluxo Lógico',
    color: '#f59e0b',
    description: 'Sequência de decisão — avance passo a passo no app',
    badgeColor: 'bg-amber-400/20 text-amber-300',
  },
  danger_zone: {
    label: 'Zona de Perigo',
    color: '#ff0055',
    description: 'Pegadinha × resposta correta — sem cards virados',
    badgeColor: 'bg-red-400/20 text-red-300',
  },
};

const FALLBACK_META: LandingNeuroslideTypeMeta = {
  label: 'NeuroSlide',
  color: '#00f2ff',
  description: 'Estudo reverso visual após cada questão',
  badgeColor: 'bg-cyan-400/20 text-cyan-300',
};

export function getLandingNeuroslideTypeMeta(slide: ReverseStudySlide | undefined): LandingNeuroslideTypeMeta {
  if (!slide?.type) return FALLBACK_META;
  return TYPE_META[slide.type] ?? FALLBACK_META;
}

export function getLandingNeuroslideTitle(slide: ReverseStudySlide | undefined, index: number): string {
  const title = slide?.slide_title?.trim();
  if (title) return title;
  const meta = getLandingNeuroslideTypeMeta(slide);
  return `${meta.label} — questão demo ${index + 1}`;
}

export type LandingNeuroslideShowcaseItem = {
  slideIndex: number;
  tipo: string;
  badgeColor: string;
  titulo: string;
};

/** Itens da vitrine (todos os 4 tipos do pacote padrão). */
export const LANDING_NEUROSLIDE_SHOWCASE: LandingNeuroslideShowcaseItem[] =
  LANDING_NEUROSLIDE_SLIDES.map((slide, slideIndex) => {
    const meta = getLandingNeuroslideTypeMeta(slide);
    return {
      slideIndex,
      tipo: meta.label,
      badgeColor: meta.badgeColor,
      titulo: getLandingNeuroslideTitle(slide, slideIndex),
    };
  });
