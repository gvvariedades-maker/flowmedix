export interface DecisionOption {
  id: string
  label: string
  outcome: string
  feedback?: string
  next?: number
  status?: 'success' | 'error'
  isCorrect?: boolean
}

export interface DecisionStep {
  id: string
  title: string
  question: string
  options: DecisionOption[]
}

export interface DecisionFlowData {
  title: string
  summary?: string
  steps: DecisionStep[]
}


