/**
 * AVANT OMNI-ARCHITECT: TypeScript Interfaces
 * 
 * Definições rigorosas para o sistema de lições e slides neuro-cognitivos.
 * Suporta o padrão "Extreme 3D Glass" com emojis e glassmorphism.
 */

import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import type { QuestaoFigure, QuestaoFigurePolicy } from '@/lib/questaoFigures';

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

export interface VersusArenaSide {
  title: string;
  points: string[];
  icon?: string;
}

// ============================================================================
// REVERSE STUDY SLIDE (Formato Semântico Simplificado - RECOMENDADO)
// ============================================================================
/** Contexto do shell premium (chip, banca, fio condutor) — passado pelo player, não no JSON da questão. */
export interface ReverseStudyShellContext {
  slideIndex: number;
  totalSlides: number;
  banca?: string;
}

export interface ReverseStudySlide {
  // Identificação do tipo de slide (obrigatório)
  type: SlideType;

  /** Override do chip de tipo (ex.: "MAPA DE CONCEITOS"). O padrão vem do `type`. */
  chip_label?: string;
  /** Título de capa do slide, abaixo do chip (opcional). */
  slide_title?: string;
  
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
  /** Revelação dos passos: `auto` (padrão, animação sequencial) ou `tap` (aluno avança). */
  reveal_mode?: 'auto' | 'tap';
  content?: string; // Para golden_rule (título/mnemônico), danger_zone
  /** Tabela de referência no golden_rule (`layout_variant` `reference_table` automático). */
  rows?: Array<{
    label: string;
    value: string;
    emphasis?: 'default' | 'highlight' | 'alert' | 'success';
    badge?: 'hot' | 'warn' | 'ok' | 'info';
  }>;
  items?: Array<{ // Para concept_map, danger_zone
    id?: string;
    label: string;
    title?: string;
    detail?: string;
    description?: string;
    icon?: string;
    color?: string;
    /** Coluna “correto” no layout comparativo (`compare`) do danger_zone. */
    correct?: string;
  }>;
  /** Bullets do danger_zone: `numbered` (padrão) ou `x_icon`. */
  bullet_style?: 'numbered' | 'x_icon';
  concepts?: Array<{ // Para concept_map (alternativa a items)
    icon: string;
    title: string;
    description: string;
  }>;
  word?: string; // Para syllable_scanner
  tonicIndex?: number; // Para syllable_scanner
  rule?: string; // Para syllable_scanner
  concept_a?: VersusArenaSide | string; // versus_arena (objeto no player; string legado no Zod)
  concept_b?: VersusArenaSide | string;
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
  id: string; // ID da alternativa (ex: "A", "B", "C" ou "C"/"E" em Certo/Errado)
  text: string; // Texto da alternativa (em C/E: "Certo" e "Errado")
  /** Presente em preview/admin; omitido no payload live ao aluno. */
  is_correct?: boolean;
}

// ============================================================================
// QUESTION DATA (Dados da questão)
// ============================================================================
export interface QuestionData {
  instruction: string; // Instrução da questão
  text_fragment?: string; // Fragmento de texto em HTML
  /** Figuras raster do enunciado (bucket questao-figures). */
  figures?: QuestaoFigure[];
  /** required = precisa figures[]; transcribed = tipografia em text_fragment. */
  figure_policy?: QuestaoFigurePolicy;
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
  /** Linha única de cabeçalho (opcional). Se ausente, o player monta a partir de banca/prova/orgao/ano. */
  header_line?: string;
  /**
   * Rótulo do cargo na linha 1 (ex.: "Técnico de Enfermagem"). Se vazio, tenta inferir de `prova` (ex.: "Tec Enf").
   * Formato: `BANCA – cargo_header (orgao) ano`
   */
  cargo_header?: string;
  topico: string; // Tópico principal (ex: "Fundamentos de Enfermagem - SAE")
  subtopico?: string; // Subtópico (ex: "História da Enfermagem")
  /** Família de questão (golden-v1) — prioriza resolução de molde L3. */
  family?: FamilyId;
  /** Ramo pedagógico L2.5 — define molde L3 quando o subtópico é bucket amplo. */
  pedagogical_branch?: string;
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
// QUESTÃO DO ASSUNTO (Status para navegação no player)
// ============================================================================
export interface QuestaoDoAssunto {
  slug: string;
  estudada: boolean; // true = aluno concluiu o estudo reverso
  /** Posição 1-based na lista completa (presente quando o servidor envia só uma janela). */
  indice?: number;
}

// ============================================================================
// AVANT LESSON PLAYER PROPS
// ============================================================================
// ============================================================================
// QUESTÃO COMPLETA (Estrutura de questão com id, usada no laboratório e admin)
// ============================================================================
export type QuestaoCompleta = LessonData & { id?: string };

// ============================================================================
// AVANT LESSON PLAYER PROPS
// ============================================================================
/** Posição da questão na lista de navegação atual (assunto, caderno ou plano). */
export interface ListaContextoQuestao {
  /** Índice 1-based na lista */
  atual: number;
  total: number;
}

export interface AvantLessonPlayerProps {
  dados: LessonData;
  mode?: 'preview' | 'live';
  proximaSlug?: string | null;
  anteriorSlug?: string | null;
  moduloSlug?: string | null;
  questoesDoAssunto?: QuestaoDoAssunto[]; // Lista de questões do mesmo assunto com status
  fromPlano?: boolean;       // true quando o aluno veio do Plano de Estudo Diário
  fromRevisoes?: boolean;    // true quando veio da fila FSRS Revisões de hoje
  /** FSRS: enunciado selecionado = last_question_id (só no fluxo from=revisoes). */
  sameStemFallback?: boolean;
  fromCaderno?: string;      // cadernoId quando o aluno veio de um Caderno de Estudo
  /** Query da vitrine (banca/assunto/q) para manter o mesmo conjunto ao trocar de questão pelos dots. */
  vitrineQuerySuffix?: string;
  /** Quando definido, exibe "Questão X de Y" conforme a lista do contexto (vitrine/assunto, caderno ou plano). */
  listaContexto?: ListaContextoQuestao;
  /** Código Q-… (modulos_estudo.avant_codigo), igual ao admin. */
  avantCodigo?: number | null;
  /** Payload desatualizado em relação à URL (soft nav) — desabilita navegação entre questões. */
  payloadStale?: boolean;
  /** Preview sem bordas/arredondamento — preenche o container (ex.: laboratório admin). */
  previewImmersive?: boolean;
  /** Preview público: abre direto em gabarito ou estudo (ex.: simulado Campina). */
  previewInitialEtapa?: 'pergunta' | 'gabarito' | 'estudo';
  /** Alternativa já escolhida no simulado público (contexto do preview). */
  previewInitialOpcaoId?: string;
}
