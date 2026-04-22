export interface DiaEstudo {
  data: string;
  count: number;
}

export interface AssuntoTop {
  nome: string;
  count: number;
}

export interface DesempenhoData {
  hoje: number;
  metaDiaria: number;
  streak: number;
  totalGeral: number;
  totalTodosTempos: number;
  serie30dias: DiaEstudo[];
  topAssuntos: AssuntoTop[];
}

export type Periodo = 7 | 15 | 30;
