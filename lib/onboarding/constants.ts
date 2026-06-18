import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Baby,
  Biohazard,
  BookOpen,
  Building2,
  HeartPulse,
  Pill,
  Shield,
  Stethoscope,
  Syringe,
} from 'lucide-react';

/** Oito áreas macro do edital AVANT (CLAUDE.md §9). */
export const ONBOARDING_TOPIC_AREAS = [
  'Fundamentos e Bases',
  'Farmacologia e Medicamentos',
  'Procedimentos de Enfermagem',
  'Biossegurança e Controle de Infecção',
  'Saúde Pública e Epidemiologia',
  'Doenças Transmissíveis',
  'Especialidades Cirúrgicas e Críticas',
  'Saúde Mental, do Trabalho e Ciclos de Vida',
] as const;

export type OnboardingTopicArea = (typeof ONBOARDING_TOPIC_AREAS)[number];

export const ONBOARDING_TOPIC_AREA_SET = new Set<string>(ONBOARDING_TOPIC_AREAS);

export const ONBOARDING_TOPIC_AREA_ICONS: Record<OnboardingTopicArea, LucideIcon> = {
  'Fundamentos e Bases': BookOpen,
  'Farmacologia e Medicamentos': Pill,
  'Procedimentos de Enfermagem': Syringe,
  'Biossegurança e Controle de Infecção': Biohazard,
  'Saúde Pública e Epidemiologia': Activity,
  'Doenças Transmissíveis': Shield,
  'Especialidades Cirúrgicas e Críticas': HeartPulse,
  'Saúde Mental, do Trabalho e Ciclos de Vida': Baby,
};

/** Bancas frequentes em concursos de Técnico de Enfermagem. */
export const ONBOARDING_BANCAS = [
  'EBSERH',
  'IDECAN',
  'CPCON',
  'FGV',
  'IADES',
  'CESGRANRIO',
  'VUNESP',
  'IBFC',
  'QUADRIX',
  'Prefeituras',
] as const;

export type OnboardingBanca = (typeof ONBOARDING_BANCAS)[number];

export const ONBOARDING_BANCA_SET = new Set<string>(ONBOARDING_BANCAS);

export const ONBOARDING_BANCA_ICONS: Record<OnboardingBanca, LucideIcon> = {
  EBSERH: Building2,
  IDECAN: Stethoscope,
  CPCON: BookOpen,
  FGV: Building2,
  IADES: Building2,
  CESGRANRIO: Building2,
  VUNESP: Building2,
  IBFC: Building2,
  QUADRIX: Building2,
  Prefeituras: Building2,
};

export const ONBOARDING_CARGA_HORARIA_OPTIONS = [5, 10, 15, 20, 30, 40] as const;
