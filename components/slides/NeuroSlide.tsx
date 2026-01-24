/**
 * NEUROSLIDE - COMPONENTE PRINCIPAL
 * 
 * Este arquivo mantém compatibilidade com imports existentes.
 * A implementação real foi movida para a estrutura modular em:
 * - components/slides/core/NeuroSlide.tsx (orquestrador)
 * - components/slides/variants/ (componentes de variantes)
 * - components/slides/core/themeGenerator.ts (sistema de temas)
 * 
 * Para novos imports, use: import NeuroSlide from '@/components/slides'
 */

export { default, NeuroSlideHub } from './core/NeuroSlide';
export type { ThemeColors } from './core/themeGenerator';
export type { Concept } from './variants/ConceptMap';
export type { SyllableScannerProps } from './variants/SyllableScanner';
