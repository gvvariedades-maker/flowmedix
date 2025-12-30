'use client'

import { DecisionSimulator } from '@/components/DecisionSimulator'
import { DecisionFlowData } from '@/types/simulator'

const PCR_FLOW: DecisionFlowData = {
  title: 'Simulador de PCR',
  summary:
    'Treine a tomada de decisão em cada etapa do fluxo de PCR: coleta, preparação do ensaio e interpretação dos resultados.',
  steps: [
    {
      id: 'sample',
      title: 'Coleta e triagem',
      question: 'Quais cuidados você reforça antes de coletar o swab nasal?',
      options: [
        {
          id: 'opt1',
          label: 'Confirma identidade do paciente e escolhe swab estéril',
          outcome: 'A coleta é feita corretamente, evitando retrabalho e contaminações.',
          feedback: 'Exato: a identificação e o material adequado são críticos para o diagnóstico molecular. ⚠️',
          isCorrect: true,
        },
        {
          id: 'opt2',
          label: 'Pula a conferência de identidade para acelerar o fluxo',
          outcome: 'A amostra chega ao laboratório sem confirmação, gerando retrabalho.',
          feedback: 'Erro: omitir a conferência pode invalidar o resultado e comprometer a rastreabilidade.',
        },
      ],
    },
    {
      id: 'prep',
      title: 'Preparação e amplificação',
      question: 'Como você garante que a reação de PCR começa com controle adequado?',
      options: [
        {
          id: 'opt3',
          label: 'Inclui controles positivo/negativo e usa protocolo validado',
          outcome: 'O ensaio está pronto para amplificar com desempenho estável.',
          feedback: 'Resposta correta: controles garantem que reagentes funcionam e detectam contaminação.',
          isCorrect: true,
        },
        {
          id: 'opt4',
          label: 'Ignora controle negativo para poupar reagentes',
          outcome: 'O laboratório não identifica contaminação cruzada e reteste é necessário.',
          feedback: 'Erro: o controle negativo detecta contaminação e não pode ser omitido.',
        },
      ],
    },
    {
      id: 'leitura',
      title: 'Interpretação dos resultados',
      question: 'O alvo principal tem Ct abaixo de 35 e o segundo alvo não amplifica. Qual conduta?',
      options: [
        {
          id: 'opt5',
          label: 'Avalia controles, replica o ensaio e inclui observação no laudo',
          outcome: 'A duplicata confirma o resultado e o laudo orienta o clínico.',
          feedback: 'Acerto: interpretar o padrão e documentar ajuda no manejo do paciente.',
          isCorrect: true,
        },
        {
          id: 'opt6',
          label: 'Descarta o resultado e repete apenas o alvo ausente',
          outcome: 'Sem controles completos, a reanálise perde validade e gera demora.',
          feedback: 'Erro: repetir apenas um alvo pode mascarar falhas no controle do ensaio.',
        },
      ],
    },
  ],
}

export default function PCRSimulatorPage() {
  return (
    <section className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Treinamento avançado</p>
          <h1 className="text-4xl font-semibold text-white">{PCR_FLOW.title}</h1>
          <p className="text-sm text-slate-400">
            Reforce a tomada de decisão em diagnósticos moleculares. Alimente o simulador com os passos do seu protocolo e pratique cada escolha antes de aplicar nas turmas.
          </p>
        </header>

        <DecisionSimulator flowData={PCR_FLOW} />
      </div>
    </section>
  )
}

