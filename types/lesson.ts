/**
 * AVANT OMNI-ARCHITECT: TypeScript Interfaces
 * 
 * Definições rigorosas para o sistema de lições e slides neuro-cognitivos.
 * Suporta o padrão "Extreme 3D Glass" com emojis e glassmorphism.
 */

// ============================================================================
// SLIDE ITEM (Componente base do NeuroSlide)
// ============================================================================
export interface SlideItem {
  id: string;
  emoji: string; // Emoji 3D (ex: "📦", "⚡", "🎯")
  label: string; // Rótulo curto (ex: "Sujeito")
  detail?: string; // Detalhe opcional (ex: "Quem pratica")
  color?: string; // Cor do ícone (ex: "text-white", "text-cyan-400")
}

// ============================================================================
// SLIDE STRUCTURE (Estrutura completa do slide)
// ============================================================================
export interface SlideStructure {
  header: {
    title: string; // Título principal (ex: "A Armadilha")
    subtitle: string; // Subtítulo (ex: "Análise Sintática")
  };
  items: SlideItem[]; // Array de itens 3D
  connector_symbol?: string; // Símbolo conector (ex: ",", "→", "→")
  connector_text?: string; // Texto de análise (ex: "Sujeito + Verbo")
  footer_rule: string; // Regra de ouro (ex: "Sempre identifique o sujeito antes do predicado")
}

// ============================================================================
// DESIGN SYSTEM (Sistema de cores e glow)
// ============================================================================
export interface DesignSystem {
  glow_color?: 'cyan' | 'orange' | 'fuchsia' | 'lime' | 'red';
  background_gradient?: string; // Tailwind gradient (ex: "from-slate-900 to-[#0B0F1A]")
  accent_color?: string; // Classe Tailwind (ex: "text-cyan-400")
}

// ============================================================================
// REVERSE STUDY SLIDE (Slide completo com design system)
// ============================================================================
export interface ReverseStudySlide {
  structure: SlideStructure;
  design_system?: DesignSystem;
  fluxo?: string; // Fluxo do estudo (ex: "A Armadilha", "A Engenharia")
}

// ============================================================================
// QUESTION OPTION (Alternativa da questão)
// ============================================================================
export interface QuestionOption {
  id: string; // ID da alternativa (ex: "A", "B", "C")
  text: string; // Texto da alternativa
  is_correct: boolean; // Se é a resposta correta
}

// ============================================================================
// QUESTION DATA (Dados da questão)
// ============================================================================
export interface QuestionData {
  instruction: string; // Instrução da questão
  text_fragment?: string; // Fragmento de texto em HTML
  options: QuestionOption[]; // Array de alternativas
}

// ============================================================================
// META DATA (Metadados da questão)
// ============================================================================
export interface LessonMeta {
  ano?: string; // Ano da prova (ex: "2023")
  banca: string; // Banca examinadora (ex: "CPCON", "FGV")
  orgao?: string; // Órgão (ex: "Prefeitura de Oliveira")
  prova?: string; // Nome da prova
  topico: string; // Tópico principal (ex: "Língua Portuguesa - Sintaxe")
  subtopico: string; // Subtópico (ex: "Termos da Oração")
}

// ============================================================================
// LESSON DATA (Estrutura completa da lição)
// ============================================================================
export interface LessonData {
  meta: LessonMeta;
  question_data: QuestionData;
  reverse_study_slides: ReverseStudySlide[];
  modulo_slug?: string; // Slug do módulo (injetado pelo laboratório)
}

// ============================================================================
// AVANT LESSON PLAYER PROPS
// ============================================================================
export interface AvantLessonPlayerProps {
  dados: LessonData;
  mode?: 'preview' | 'live';
  proximaSlug?: string | null;
  anteriorSlug?: string | null;
  moduloSlug?: string | null;
}
