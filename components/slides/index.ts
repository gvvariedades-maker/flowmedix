// ============================================================================
// EXPORTAÇÕES PRINCIPAIS DO SISTEMA DE SLIDES
// ============================================================================

// Componente principal (default export)
export { default } from './core/NeuroSlide';
export { NeuroSlideHub } from './core/NeuroSlide';

// Variantes de slides
export { ConceptMap } from './variants/ConceptMap';
export { GoldenRule } from './variants/GoldenRule';
export { DangerZone } from './variants/DangerZone';
export { LogicFlow } from './variants/LogicFlow';
export { SyllableScanner } from './variants/SyllableScanner';

// Sistema de temas
export { 
  getThemeForSlide, 
  generateSimpleHash, 
  getThemeStyles,
  SUBJECT_THEME_MAP 
} from './core/themeGenerator';
export type { ThemeColors } from './core/themeGenerator';

// Tipos e interfaces
export type { Concept } from './variants/ConceptMap';
export type { SyllableScannerProps } from './variants/SyllableScanner';
