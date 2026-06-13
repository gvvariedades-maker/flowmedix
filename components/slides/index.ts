// ============================================================================
// EXPORTAÇÕES PRINCIPAIS DO SISTEMA DE SLIDES
// ============================================================================

// Componente principal (default export)
export { default } from './core/NeuroSlide';
export { NeuroSlideHub } from './core/NeuroSlide';

// Variantes de slides
export { ConceptMap } from './variants/ConceptMap';
export { MorphologicalConceptMap } from './variants/MorphologicalConceptMap';
export { ProcedureProtocolConceptMap } from './variants/ProcedureProtocolConceptMap';
export { VitalsPanelConceptMap } from './variants/VitalsPanelConceptMap';
export { SurvivalChainConceptMap } from './variants/SurvivalChainConceptMap';
export { VaccineTimelineConceptMap } from './variants/VaccineTimelineConceptMap';
export { SaeDocumentationConceptMap } from './variants/SaeDocumentationConceptMap';
export { SaeResponsibilityMatrix } from './variants/SaeResponsibilityMatrix';
export { SusLegalPillarsConceptMap } from './variants/SusLegalPillarsConceptMap';
export { SusArt4OrbitConceptMap } from './variants/SusArt4OrbitConceptMap';
export { DangerZoneScopeTrap } from './variants/DangerZoneScopeTrap';
export { DangerZoneNormReveal } from './variants/DangerZoneNormReveal';
export { GoldenRule } from './variants/GoldenRule';
export { DangerZone } from './variants/DangerZone';
export { DangerZoneTrapReveal } from './variants/DangerZoneTrapReveal';
export { DangerZoneCalendarMismatch } from './variants/DangerZoneCalendarMismatch';
export { LogicFlow } from './variants/LogicFlow';
export { SyllableScanner } from './variants/SyllableScanner';
export { VersusArena } from './variants/VersusArena';

// Sistema de temas
export { 
  getThemeForSlide, 
  generateSimpleHash, 
  getThemeStyles,
  SUBJECT_THEME_MAP,
  SUBTOPIC_DESIGN_MAP,
  getDesignBySubtopic,
  getLayoutVariantBySubtopic,
  calculateLayoutVariantFromType,
} from './core/themeGenerator';
export type { ThemeColors } from './core/themeGenerator';

// Tipos e interfaces
export type { Concept } from './variants/ConceptMap';
export type { SyllableScannerProps } from './variants/SyllableScanner';
