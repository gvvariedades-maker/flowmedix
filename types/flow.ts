/**
 * Tipos da estrutura JSON de fluxograma armazenada no banco.
 * Definidos localmente (formato React Flow) para nao depender do pacote
 * @xyflow/react — o conteudo e apenas dados serializados, sem runtime.
 */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Node<
  Data extends Record<string, unknown> = Record<string, unknown>,
  Type extends string = string,
> {
  id: string;
  position: { x: number; y: number };
  data: Data;
  type?: Type;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  [key: string]: unknown;
}

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
  [key: string]: unknown;
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

