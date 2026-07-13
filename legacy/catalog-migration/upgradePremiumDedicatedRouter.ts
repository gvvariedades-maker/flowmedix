import type { FamilyId, QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import {
  buildCalculoPremiumSlidesForFamily,
  calculoGoldenReferenceForFamily,
  canBuildCalculoPremiumSlides,
  isCalculoSubtopico,
} from '@/legacy/catalog-migration/upgradePremiumCalculo';
import {
  buildColetaPremiumSlidesForFamily,
  canBuildColetaPremiumSlides,
  COLETA_GOLDEN_FILE,
  isColetaSubtopico,
} from '@/legacy/catalog-migration/upgradePremiumColeta';
import {
  buildCurativosPremiumSlidesForFamily,
  canBuildCurativosPremiumSlides,
  CURATIVOS_GOLDEN_FILE,
  isCurativosSubtopico,
} from '@/legacy/catalog-migration/upgradePremiumCurativos';
import {
  buildImunizacaoPremiumSlidesForFamily,
  canBuildImunizacaoPremiumSlides,
  imunizacaoGoldenReferenceForFamily,
  isImunizacaoSubtopico,
} from '@/legacy/catalog-migration/upgradePremiumImunizacao';
import {
  buildIstsPremiumSlidesForFamily,
  canBuildIstsPremiumSlides,
  ISTS_GOLDEN_FILE,
  isIstsSubtopico,
} from '@/legacy/catalog-migration/upgradePremiumIsts';
import {
  buildOxigenoterapiaPremiumSlidesForFamily,
  canBuildOxigenoterapiaPremiumSlides,
  isOxigenoterapiaSubtopico,
  OXIGENO_GOLDEN_FILE,
} from '@/legacy/catalog-migration/upgradePremiumOxigenoterapia';
import {
  buildRespiratorioCronicoPremiumSlidesForFamily,
  canBuildRespiratorioCronicoPremiumSlides,
  isRespiratorioCronicoSubtopico,
  respiratorioCronicoGoldenReferenceForInput,
} from '@/legacy/catalog-migration/upgradePremiumRespiratorioCronico';
import {
  buildPuncaoPremiumSlidesForFamily,
  canBuildPuncaoPremiumSlides,
  isPuncaoSubtopico,
  puncaoGoldenReferenceForInput,
} from '@/legacy/catalog-migration/upgradePremiumPuncao';
import {
  buildSaePremiumSlidesForFamily,
  canBuildSaePremiumSlides,
  isSaeSubtopico,
  SAE_GOLDEN_FILE,
} from '@/legacy/catalog-migration/upgradePremiumSae';
import {
  buildSaudeMentalPremiumSlidesForFamily,
  canBuildSaudeMentalPremiumSlides,
  isSaudeMentalSubtopico,
  saudeMentalGoldenReferenceForInput,
} from '@/legacy/catalog-migration/upgradePremiumSaudeMental';
import {
  buildSondasPremiumSlidesForFamily,
  canBuildSondasPremiumSlides,
  isSondasSubtopico,
  SONDAS_GOLDEN_FILE,
} from '@/legacy/catalog-migration/upgradePremiumSondas';
import {
  buildSinaisPremiumSlidesForFamily,
  canBuildSinaisPremiumSlides,
  isSinaisSubtopico,
  sinaisGoldenReferenceForFamily,
} from '@/legacy/catalog-migration/upgradePremiumSinais';
import {
  buildUrgenciasPremiumSlidesForFamily,
  canBuildUrgenciasPremiumSlides,
  isUrgenciasSubtopico,
  URGENCIAS_GOLDEN_FILE,
} from '@/legacy/catalog-migration/upgradePremiumUrgencias';
import {
  buildViasPremiumSlidesForFamily,
  canBuildViasPremiumSlides,
  isViasSubtopico,
  VIAS_GOLDEN_FILE,
} from '@/legacy/catalog-migration/upgradePremiumVias';

type SlideRecord = Record<string, unknown>;

export type DedicatedBuilderInput = {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
  family: FamilyId;
};

export type DedicatedBuilderMatch = {
  goldenReference: string;
  buildSlides: () => SlideRecord[];
};

/** Primeiro builder dedicado que aceitar o subtópico + enunciado (ordem = prioridade). */
export function matchDedicatedPremiumBuilder(
  input: DedicatedBuilderInput,
): DedicatedBuilderMatch | null {
  const slideInput = {
    instruction: input.instruction,
    options: input.options,
    topico: input.topico,
    subtopico: input.subtopico,
  };

  if (isSinaisSubtopico(input.subtopico) && canBuildSinaisPremiumSlides(input.instruction, input.family)) {
    return {
      goldenReference: sinaisGoldenReferenceForFamily(input.family),
      buildSlides: () => buildSinaisPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isImunizacaoSubtopico(input.subtopico) &&
    canBuildImunizacaoPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: imunizacaoGoldenReferenceForFamily(input.family),
      buildSlides: () => buildImunizacaoPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isCurativosSubtopico(input.subtopico) &&
    canBuildCurativosPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: CURATIVOS_GOLDEN_FILE,
      buildSlides: () => buildCurativosPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (isPuncaoSubtopico(input.subtopico) && canBuildPuncaoPremiumSlides(input.instruction, input.family)) {
    return {
      goldenReference: puncaoGoldenReferenceForInput(input.instruction, input.options),
      buildSlides: () => buildPuncaoPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (isColetaSubtopico(input.subtopico) && canBuildColetaPremiumSlides(input.instruction, input.family)) {
    return {
      goldenReference: COLETA_GOLDEN_FILE,
      buildSlides: () => buildColetaPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (isViasSubtopico(input.subtopico) && canBuildViasPremiumSlides(input.instruction, input.family)) {
    return {
      goldenReference: VIAS_GOLDEN_FILE,
      buildSlides: () => buildViasPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isUrgenciasSubtopico(input.subtopico) &&
    canBuildUrgenciasPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: URGENCIAS_GOLDEN_FILE,
      buildSlides: () => buildUrgenciasPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isOxigenoterapiaSubtopico(input.subtopico) &&
    canBuildOxigenoterapiaPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: OXIGENO_GOLDEN_FILE,
      buildSlides: () => buildOxigenoterapiaPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isRespiratorioCronicoSubtopico(input.subtopico) &&
    canBuildRespiratorioCronicoPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: respiratorioCronicoGoldenReferenceForInput(
        input.instruction,
        input.options,
        input.family,
      ),
      buildSlides: () => buildRespiratorioCronicoPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (isIstsSubtopico(input.subtopico) && canBuildIstsPremiumSlides(input.instruction, input.family)) {
    return {
      goldenReference: ISTS_GOLDEN_FILE,
      buildSlides: () => buildIstsPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isCalculoSubtopico(input.subtopico) &&
    canBuildCalculoPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: calculoGoldenReferenceForFamily(input.family),
      buildSlides: () => buildCalculoPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  // Cálculo em outros subtópicos (ex.: Saúde da Mulher) — evita golden_rule hybrid com [IA].
  if (
    input.family === 'calc' &&
    canBuildCalculoPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: calculoGoldenReferenceForFamily(input.family),
      buildSlides: () => buildCalculoPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (isSaeSubtopico(input.subtopico) && canBuildSaePremiumSlides(input.instruction, input.family)) {
    return {
      goldenReference: SAE_GOLDEN_FILE,
      buildSlides: () => buildSaePremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isSaudeMentalSubtopico(input.subtopico) &&
    canBuildSaudeMentalPremiumSlides(input.instruction, input.options, input.family)
  ) {
    return {
      goldenReference: saudeMentalGoldenReferenceForInput(
        input.instruction,
        input.options,
        input.family,
      ),
      buildSlides: () => buildSaudeMentalPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  if (
    isSondasSubtopico(input.subtopico) &&
    canBuildSondasPremiumSlides(input.instruction, input.family)
  ) {
    return {
      goldenReference: SONDAS_GOLDEN_FILE,
      buildSlides: () => buildSondasPremiumSlidesForFamily(slideInput, input.family),
    };
  }

  return null;
}

export function hasDedicatedPremiumBuilder(input: DedicatedBuilderInput): boolean {
  return matchDedicatedPremiumBuilder(input) !== null;
}
