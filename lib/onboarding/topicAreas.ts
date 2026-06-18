import { CANONICAL_SUBTOPICOS } from '@/lib/catalogMigration/canonicalSubtopicos';
import {
  ONBOARDING_TOPIC_AREAS,
  type OnboardingTopicArea,
} from '@/lib/onboarding/constants';

/** Subtópicos canônicos por área macro do onboarding (CLAUDE.md §9). */
export const ONBOARDING_AREA_SUBTOPICOS: Record<OnboardingTopicArea, readonly string[]> = {
  'Fundamentos e Bases': CANONICAL_SUBTOPICOS.slice(0, 4),
  'Farmacologia e Medicamentos': CANONICAL_SUBTOPICOS.slice(4, 8),
  'Procedimentos de Enfermagem': CANONICAL_SUBTOPICOS.slice(8, 17),
  'Biossegurança e Controle de Infecção': CANONICAL_SUBTOPICOS.slice(17, 22),
  'Saúde Pública e Epidemiologia': CANONICAL_SUBTOPICOS.slice(22, 26),
  'Doenças Transmissíveis': CANONICAL_SUBTOPICOS.slice(26, 33),
  'Especialidades Cirúrgicas e Críticas': CANONICAL_SUBTOPICOS.slice(33, 36),
  'Saúde Mental, do Trabalho e Ciclos de Vida': CANONICAL_SUBTOPICOS.slice(36, 41),
};

const SUBTOPICO_TO_AREA = new Map<string, OnboardingTopicArea>();

for (const area of ONBOARDING_TOPIC_AREAS) {
  for (const subtopico of ONBOARDING_AREA_SUBTOPICOS[area]) {
    SUBTOPICO_TO_AREA.set(subtopico.toLowerCase(), area);
  }
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

/** Resolve área macro a partir de `titulo_aula` / subtópico canônico. */
export function resolveOnboardingAreaFromTitulo(
  tituloAula: string | null | undefined,
): OnboardingTopicArea | null {
  const norm = normalizeLabel(tituloAula ?? '');
  if (!norm) return null;

  for (const [subtopico, area] of SUBTOPICO_TO_AREA.entries()) {
    if (norm === subtopico || norm.includes(subtopico) || subtopico.includes(norm)) {
      return area;
    }
  }

  return null;
}

export function tituloMatchesOnboardingAreas(
  tituloAula: string | null | undefined,
  areas: readonly string[],
): boolean {
  const resolved = resolveOnboardingAreaFromTitulo(tituloAula);
  if (!resolved) return false;
  return areas.some((area) => normalizeLabel(area) === normalizeLabel(resolved));
}

export function subtopicosForOnboardingAreas(areas: readonly string[]): string[] {
  const out = new Set<string>();
  for (const area of areas) {
    const key = area as OnboardingTopicArea;
    const subtopicos = ONBOARDING_AREA_SUBTOPICOS[key];
    if (subtopicos) {
      for (const sub of subtopicos) out.add(sub);
    }
  }
  return [...out];
}
