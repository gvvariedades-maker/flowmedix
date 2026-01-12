'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lock,
  PlayCircle,
  Stethoscope,
} from 'lucide-react'
import { DecisionFlowData, DecisionOption } from '@/types/simulator'

interface DecisionSimulatorProps {
  flowData: DecisionFlowData
}

export function DecisionSimulator({ flowData }: DecisionSimulatorProps) {
  const initialStepId = flowData.steps[0]?.id ?? null
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [successFeedback, setSuccessFeedback] = useState<{ message: string; next?: number } | null>(null)
  const [currentView, setCurrentView] = useState<'map' | 'decision'>('map')
  const [selectedStepId, setSelectedStepId] = useState<string | number | null>(initialStepId)
  const [unlockedSteps, setUnlockedSteps] = useState<Array<string | number>>(
    () => (initialStepId !== null ? [initialStepId] : [])
  )

  const selectedStep = useMemo(
    () => flowData.steps.find((step) => step.id === selectedStepId) ?? null,
    [flowData.steps, selectedStepId]
  )

  const technicalTerms = ['Dose', 'Via', 'Protocolo', 'Tempo', 'Infusão', 'Bolus']

  const highlightTerms = (line: string) => {
    const regex = new RegExp(`(${technicalTerms.join('|')})`, 'gi')
    const parts = line.split(regex)
    return parts.map((part, index) => {
      if (!part) {
        return null
      }
      const isKeyword = technicalTerms.some(
        (term) => term.toLowerCase() === part.toLowerCase()
      )
      if (isKeyword) {
        return (
          <span key={`${part}-${index}`} className="text-clinical-accent font-semibold">
            {part}
          </span>
        )
      }
      return <span key={`${part}-${index}`}>{part}</span>
    })
  }

  const splitIntoTopics = (value: string) => {
    const matches = value.match(/[^.!?]+[.!?]?/g) ?? []
    return matches
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0)
  }

  const FeedbackCard = ({
    status,
    subject,
    text,
    children,
  }: {
    status: 'success' | 'error'
    subject: string
    text: string
    children?: ReactNode
  }) => {
    const isSuccess = status === 'success'
    const topics = splitIntoTopics(text)
    const patternStyle = isSuccess
      ? {
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.08) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.08) 75%, transparent 75%, transparent)',
          backgroundSize: '40px 40px',
        }
      : undefined

    const Icon = isSuccess ? CheckCircle2 : AlertCircle

    return (
      <div
        className="relative overflow-hidden rounded-[2.5rem] p-8 h-full transition-all duration-500"
        style={patternStyle}
      >
        <div
          className={`relative z-10 flex h-full flex-col items-center justify-between gap-6 rounded-[2.5rem] p-8 ${
            isSuccess
              ? 'bg-emerald-950/30 border border-clinical-success/60 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
              : 'bg-[#1b0b0f]/80 border border-clinical-error/60 shadow-[0_0_15px_rgba(255,0,85,0.2)]'
          }`}
        >
          <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-10">
            {isSuccess ? <Stethoscope size={200} /> : <Activity size={200} />}
          </div>

          <div className="flex flex-col items-center gap-3">
            <div
              className={`relative flex items-center justify-center rounded-full bg-white/5 p-6 text-white/80 backdrop-blur-md ${
                isSuccess ? 'text-clinical-success' : 'text-clinical-error'
              }`}
            >
              <div className="relative">
                {isSuccess ? (
                  <>
                    <CheckCircle2 size={80} className="relative z-10" />
                    <div className="absolute inset-0 blur-xl bg-clinical-success/50" />
                  </>
                ) : (
                  <>
                    <AlertTriangle size={80} className="relative z-10" />
                    <div className="absolute inset-0 blur-xl bg-clinical-error/50" />
                  </>
                )}
              </div>
            </div>
            <p
              className={`text-xs uppercase tracking-[0.5em] ${
                isSuccess ? 'text-clinical-success' : 'text-clinical-error'
              }`}
            >
              Resumo Técnico
            </p>
            <h3
              className={`text-2xl font-black uppercase tracking-tight ${
                isSuccess ? 'text-clinical-success' : 'text-clinical-error'
              }`}
            >
              RESUMO TÉCNICO: {subject}
            </h3>
          </div>

          <div className="space-y-4 text-left text-lg leading-relaxed text-white">
            {topics.map((topic, index) => (
              <div key={`topic-${index}`} className="flex items-flex-start gap-3">
                <Icon className={isSuccess ? 'text-clinical-success mt-1' : 'text-clinical-error mt-1'} size={16} />
                <span>{highlightTerms(topic)}</span>
              </div>
            ))}
          </div>

          {children && (
            <div className="w-full">
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!flowData?.steps?.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
        Loading...
      </div>
    )
  }

  const lastUnlockedId = unlockedSteps[unlockedSteps.length - 1]

  const handleOption = (option: DecisionOption) => {
    const status = option.status ?? 'success'
    if (status === 'error') {
      setSuccessFeedback(null)
      setAlertMessage(option.feedback ?? option.outcome ?? 'Resposta incorreta. Tente novamente.')
      return
    }
    setAlertMessage(null)
    setSuccessFeedback({
      message: option.feedback ?? 'Parabéns! Resposta correta.',
      next: option.next,
    })
  }

  const handleAdvanceFromSuccess = () => {
    if (!successFeedback) {
      return
    }
    const nextStepId = successFeedback.next
    setSuccessFeedback(null)
    if (nextStepId !== undefined && !unlockedSteps.includes(nextStepId)) {
      setUnlockedSteps((steps) => [...steps, nextStepId])
      setSelectedStepId(nextStepId)
    }
    setAlertMessage(null)
    setCurrentView('map')
  }

  const handleSelectStep = (stepId: string | number) => {
    if (!unlockedSteps.includes(stepId)) {
      return
    }
    setSelectedStepId(stepId)
    setAlertMessage(null)
    setSuccessFeedback(null)
    setCurrentView('decision')
  }

  return (
    <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-slate-900 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">Simulador de Missão</p>
        <h3 className="text-2xl font-semibold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
          {flowData.title}
        </h3>
        {flowData.summary && <p className="text-sm text-clinical-muted">{flowData.summary}</p>}
      </header>

      <AnimatePresence mode="wait">
        {currentView === 'map' && (
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="space-y-5 w-full max-w-6xl mx-auto"
          >
            <p className="text-sm uppercase text-clinical-muted tracking-[0.4em]">Mapa de Missão</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flowData.steps.map((step, index) => {
                const isUnlocked = unlockedSteps.includes(step.id)
                const isCurrent = step.id === lastUnlockedId
                const isLocked = !isUnlocked
                const baseClasses = [
                  'glass-panel',
                  'aspect-square',
                  'flex',
                  'flex-col',
                  'items-center',
                  'justify-center',
                  'text-center',
                  'p-6',
                  'rounded-3xl',
                  'border',
                  'bg-slate-900/60',
                  'transition',
                  'duration-300',
                ]
                if (isLocked) {
                  baseClasses.push('opacity-40', 'scale-95', 'border-slate-800', 'cursor-not-allowed')
                } else if (isCurrent) {
                  baseClasses.push('border-clinical-accent', 'shadow-neon-cyan', 'animate-pulse', 'hover:scale-105', 'hover:bg-white/10')
                } else {
                  baseClasses.push('border-clinical-success/40', 'hover:scale-105', 'hover:bg-white/10')
                }
                const Icon = isUnlocked ? (isCurrent ? PlayCircle : CheckCircle2) : Lock
                return (
                  <motion.button
                    key={step.id}
                    onClick={() => handleSelectStep(step.id)}
                    disabled={isLocked}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className={baseClasses.join(' ')}
                  >
                    <Icon size={40} className={`${isUnlocked ? (isCurrent ? 'text-clinical-accent' : 'text-clinical-success') : 'text-slate-500'}`} />
                    <span className="font-bold tracking-wider uppercase text-xs mt-4">Passo {String(index + 1).padStart(2, '0')}</span>
                    <p className="text-white/90 mt-1 text-sm">{step.title}</p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {currentView === 'decision' && selectedStep && (
          <motion.div
            key="decision-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <button
              type="button"
              onClick={() => {
                setCurrentView('map')
                setAlertMessage(null)
                setSuccessFeedback(null)
              }}
              className="text-clinical-accent hover:underline"
            >
              ← Voltar para o Mapa de Missão
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="glass-panel p-8 h-full flex flex-col gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm uppercase tracking-[0.4em] text-clinical-muted">{selectedStep.title}</h4>
                  <p className="text-3xl font-semibold text-white">{selectedStep.question}</p>
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  {(selectedStep?.options ?? []).map((option, index) => (
                    <button
                      key={`${option.id}-${index}`}
                      onClick={() => handleOption(option)}
                      className="btn-option group flex w-full flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-4 text-left text-sm text-clinical-muted transition hover:border-clinical-accent"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-clinical-accent" />
                        <p className="font-semibold text-white">{option.label}</p>
                      </div>
                      <p className="text-xs text-clinical-muted">{option.outcome}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass-panel relative flex h-full items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-[0_0_30px_rgba(0,0,0,0.55)] transition-all duration-500">
                <AnimatePresence mode="wait">
                  {successFeedback ? (
                    <motion.div
                      key="feedback-success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <FeedbackCard status="success" subject={selectedStep.title} text={successFeedback.message}>
                        <button
                          type="button"
                          onClick={handleAdvanceFromSuccess}
                          className="w-full rounded-2xl bg-clinical-accent text-clinical-dark font-bold px-4 py-3 uppercase tracking-[0.25em] shadow-neon-cyan transition hover:shadow-[0_0_25px_rgba(0,255,136,0.6)]"
                        >
                          Próximo passo
                        </button>
                      </FeedbackCard>
                    </motion.div>
                  ) : alertMessage ? (
                    <motion.div
                      key="feedback-error"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <FeedbackCard status="error" subject={selectedStep.title} text={alertMessage} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="feedback-idle"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="space-y-4"
                    >
                      <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="text-xs uppercase tracking-[0.4em] text-clinical-muted">
                        Aguardando decisão
                      </p>
                      <p className="text-sm text-white">Selecione uma opção para ver a análise técnica</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default DecisionSimulator

