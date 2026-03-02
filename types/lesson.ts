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
    subtitle?: string; // Subtítulo (ex: "Análise Sintática")
  };
  items?: SlideItem[]; // Array de itens 3D (opcional para alguns layouts)
  connector_symbol?: string; // Símbolo conector (ex: ",", "→", "→")
  connector_text?: string; // Texto de análise (ex: "Sujeito + Verbo")
  footer_rule: string; // Regra de ouro (ex: "Sempre identifique o sujeito antes do predicado")
  q_header?: string; // Badge discreto e profissional
  texto_base?: string; // Texto de apoio com separação clara
  statement?: string; // Destaque máximo para o que precisa ser lido
  steps?: string[]; // Array de passos (para layout logic_flow)
  main_text?: string; // Texto principal (para layout golden_rule)
}

// ============================================================================
// DESIGN SYSTEM (Sistema de cores e glow) - DEPRECATED: Usar subject para tema automático
// ============================================================================
export interface DesignSystem {
  glow_color?: 'cyan' | 'orange' | 'fuchsia' | 'lime' | 'red';
  background_gradient?: string; // Tailwind gradient (ex: "from-slate-900 to-[#0B0F1A]")
  accent_color?: string; // Classe Tailwind (ex: "text-cyan-400")
}

// ============================================================================
// LAYOUT TYPES (Tipos de layout disponíveis)
// ============================================================================
export type LayoutType = 'concept_map' | 'danger_zone' | 'logic_flow' | 'golden_rule' | 'syllable_scanner' | 'versus_arena';
export type SlideType = 'concept_map' | 'danger_zone' | 'logic_flow' | 'golden_rule' | 'syllable_scanner' | 'versus_arena';

// ============================================================================
// REVERSE STUDY SLIDE (Formato Semântico Simplificado - RECOMENDADO)
// ============================================================================
export interface ReverseStudySlide {
  // Identificação do tipo de slide (obrigatório)
  type: SlideType;
  
  // Metadados semânticos (para geração automática de tema)
  subject?: string; // Mapeia automaticamente para tema visual
  /** ID do template visual (ex: "t01"-"t15") ou nome do tema (ex: "violet"). Prioridade máxima. */
  template?: string;
  /** Alias de template. Usado quando o JSON especifica tema por ID. */
  theme_id?: string;
  meta?: {
    topico?: string;
    subtopico?: string;
    [key: string]: unknown;
  };
  
  // Dados semânticos específicos por tipo (semânticos apenas)
  steps?: string[]; // Para logic_flow
  content?: string; // Para golden_rule, danger_zone
  items?: Array<{ // Para concept_map, danger_zone
    id?: string;
    label: string;
    title?: string;
    detail?: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
  concepts?: Array<{ // Para concept_map (alternativa a items)
    icon: string;
    title: string;
    description: string;
  }>;
  word?: string; // Para syllable_scanner
  tonicIndex?: number; // Para syllable_scanner
  rule?: string; // Para syllable_scanner
  concept_a?: string; // Para versus_arena
  concept_b?: string; // Para versus_arena
  footer_rule?: string; // Regra de ouro (opcional)
  
  // Campos de compatibilidade com formato antigo (DEPRECATED)
  layout_type?: LayoutType; // DEPRECATED: usar 'type'
  structure?: SlideStructure; // DEPRECATED: usar campos diretos
  design_system?: DesignSystem; // DEPRECATED: tema gerado automaticamente do subject
  layout_variant?: string; // DEPRECATED: calculado automaticamente no componente
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
  banca: string; // Banca examinadora (ex: "EBSERH", "FGV")
  orgao?: string; // Órgão (ex: "Prefeitura de Oliveira")
  prova?: string; // Nome da prova
  topico: string; // Tópico principal (ex: "Fundamentos de Enfermagem - SAE")
  subtopico: string; // Subtópico (ex: "Termos da Oração")
}

// ============================================================================
// LESSON DATA (Estrutura completa da lição)
// ============================================================================
export interface LessonData {
  meta: LessonMeta;
  question_data: QuestionData;
  reverse_study_slides?: ReverseStudySlide[]; // Array principal de slides de estudo reverso
  study_slides?: ReverseStudySlide[]; // Fallback alternativo (caso mude a chave no futuro JSON)
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
