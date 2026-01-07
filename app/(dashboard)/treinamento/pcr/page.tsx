'use client'

import { DecisionSimulator } from '@/components/DecisionSimulator'
import { DecisionFlowData } from '@/types/simulator'

const ESTUDO_REVERSO_FLOW: DecisionFlowData = {
  title: 'Simulador de Estudo Reverso - Português',
  summary:
    'Treine a tomada de decisão em cada etapa do estudo reverso: leitura, interpretação textual e análise gramatical.',
  steps: [
    {
      id: 'sample',
      title: 'Leitura e compreensão',
      question: 'Quais estratégias você utiliza na primeira leitura do texto?',
      options: [
        {
          id: 'opt1',
          label: 'Identifica tema, objetivo e palavras-chave principais',
          outcome: 'A compreensão inicial está sólida, facilitando as próximas etapas.',
          feedback: 'Exato: identificar esses elementos é fundamental para uma análise eficiente. ⚠️',
          isCorrect: true,
        },
        {
          id: 'opt2',
          label: 'Lê rapidamente sem destacar elementos importantes',
          outcome: 'A compreensão fica superficial e será necessário reler várias vezes.',
          feedback: 'Erro: uma leitura atenta e estratégica economiza tempo e melhora o desempenho.',
        },
      ],
    },
    {
      id: 'prep',
      title: 'Interpretação e análise',
      question: 'Como você garante uma interpretação textual adequada?',
      options: [
        {
          id: 'opt3',
          label: 'Analisa argumentos, recursos de coesão e relações entre ideias',
          outcome: 'A interpretação está completa e fundamentada no texto.',
          feedback: 'Resposta correta: essa análise garante compreensão profunda do texto.',
          isCorrect: true,
        },
        {
          id: 'opt4',
          label: 'Foca apenas no que parece mais importante',
          outcome: 'A interpretação fica incompleta e pode levar a erros de compreensão.',
          feedback: 'Erro: uma análise completa considera todos os elementos textuais relevantes.',
        },
      ],
    },
    {
      id: 'leitura',
      title: 'Análise gramatical',
      question: 'Ao identificar um erro gramatical, qual conduta você adota?',
      options: [
        {
          id: 'opt5',
          label: 'Analisa o contexto, identifica a regra aplicável e justifica a correção',
          outcome: 'A análise está completa e fundamentada teoricamente.',
          feedback: 'Acerto: essa abordagem consolida o aprendizado e melhora o desempenho.',
          isCorrect: true,
        },
        {
          id: 'opt6',
          label: 'Apenas identifica o erro sem analisar a regra',
          outcome: 'O aprendizado fica superficial e não se consolida.',
          feedback: 'Erro: entender a regra é essencial para aplicar o conhecimento em outras situações.',
        },
      ],
    },
  ],
}

export default function EstudoReversoSimulatorPage() {
  return (
    <section className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Estudo Reverso</p>
          <h1 className="text-4xl font-semibold text-white">{ESTUDO_REVERSO_FLOW.title}</h1>
          <p className="text-sm text-slate-400">
            Reforce a tomada de decisão em questões de Língua Portuguesa. Pratique cada etapa do estudo reverso e consolide seu aprendizado para concursos públicos.
          </p>
        </header>

        <DecisionSimulator flowData={ESTUDO_REVERSO_FLOW} />
      </div>
    </section>
  )
}

