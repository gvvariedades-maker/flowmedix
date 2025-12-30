import { Node, Edge, Viewport } from '@xyflow/react';

/**
 * Tipos customizados de nós para o React Flow
 */
export type CustomNodeType = 
  | 'start-node'      // Nó inicial (verde/teal)
  | 'action-node'     // Nó de ação (azul/cyan)
  | 'decision-node'   // Nó de decisão (amarelo)
  | 'risk-node';      // Nó de risco/erro (vermelho/rose)

/**
 * Dados customizados que cada nó pode conter
 */
export interface CustomNodeData {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
}

/**
 * Estrutura completa de um nó customizado
 */
export type CustomNode = Node<CustomNodeData, CustomNodeType>;

/**
 * Estrutura completa de uma aresta customizada
 */
export type CustomEdge = Edge;

/**
 * Estrutura JSON armazenada no banco de dados
 * Segue o padrão do React Flow
 */
export interface FlowchartContent {
  nodes: CustomNode[];
  edges: CustomEdge[];
  viewport: Viewport;
}

/**
 * Metadados de um fluxograma
 */
export interface FlowchartMetadata {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content: FlowchartContent;
  created_at: string;
  updated_at: string;
}

