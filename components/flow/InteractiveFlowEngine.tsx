'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';

export interface FlowOption {
  label: string;
  nextId?: number;
  status?: 'success' | 'error' | 'neutral';
  feedback?: string;
}

export interface FlowStep {
  id: number;
  title: string;
  description?: string;
  question: string;
  color?: string;
  options: FlowOption[];
}

export interface InteractiveFlowEngineProps {
  steps: FlowStep[];
  initialStepId?: number;
  onComplete?: (step: FlowStep) => void;
}

const sampleSteps: FlowStep[] = [
  {
    id: 0,
    title: 'PCR - Chegada ao local',
    description: 'Avalie o cenário antes de encostar no paciente.',
    question: 'Paciente está responsivo e com respiração adequada?',
    color: '#0ea5e9',
    options: [
      {
        label: 'Sim, está consciente',
        nextId: 1,
        status: 'success',
      },
      {
        label: 'Não responde, sem respiração',
        nextId: 2,
        status: 'error',
        feedback: 'Acionou protocolo de emergência. Continue para PCR completo.',
      },
    ],
  },
  {
    id: 1,
    title: 'Monitorização',
    description: 'Mantenha sinais vitais sob observação constante.',
    question: 'Você já havia acionado o desfibrilador?',
    color: '#10b981',
    options: [
      {
        label: 'Sim, pronto para uso',
        nextId: 3,
        status: 'success',
        feedback: 'Excelente; prepare o primeiro choque em até 3 minutos.',
      },
      {
        label: 'Ainda não: falta tempo',
        nextId: 2,
        status: 'error',
        feedback: 'Tempo crítico. Refaça a rápida avaliação e avance para o próximo passo.',
      },
    ],
  },
  {
    id: 2,
    title: 'Intervenção de PCR',
    description: 'Siga os ciclos recomendados de compressões torácicas.',
    question: 'Você iniciou compressões imediatas?',
    color: '#f97316',
    options: [
      {
        label: 'Sim, compressões contínuas',
        nextId: 3,
        status: 'success',
      },
      {
        label: 'Ainda não',
        status: 'error',
        feedback: 'Entenda que isso coloca o paciente em risco. Revisite o passo anterior.',
      },
    ],
  },
  {
    id: 3,
    title: 'Encerramento',
    description: 'Revise os dados e informe a equipe de apoio.',
    question: 'Fluxo concluído. Deseja revisar o protocolo?',
    color: '#6366f1',
    options: [
      {
        label: 'Sim, voltar ao início',
        nextId: 0,
        status: 'neutral',
      },
      {
        label: 'Não, finalizar simulação',
        status: 'success',
      },
    ],
  },
  {
    id: 99,
    title: 'Checagem final',
    description: 'Você escolheu avançar após o alerta. Que tal revisar tudo antes?',
    question: 'Deseja reiniciar a simulação?',
    color: '#7c3aed',
    options: [
      {
        label: 'Reiniciar simulação',
        nextId: 0,
        status: 'success',
      },
    ],
  },
];

export function InteractiveFlowEngine({
  steps = sampleSteps,
  initialStepId,
  onComplete,
}: InteractiveFlowEngineProps) {
  const [currentStepId, setCurrentStepId] = useState<number>(
    initialStepId ?? steps[0]?.id ?? 0
  );
  const [pendingNext, setPendingNext] = useState<number | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [direction, setDirection] = useState<number>(1);

  const currentStep = useMemo(
    () => steps.find((step) => step.id === currentStepId) ?? steps[0],
    [currentStepId, steps]
  );

  const handleOptionClick = (option: FlowOption) => {
    const nextId = option.nextId ?? currentStepId;

    if (option.status === 'error') {
      setErrorFeedback(option.feedback ?? 'Erro detectado. Reveja as instruções.');
      setPendingNext(nextId);
      setDirection(1);
      return;
    }

    setErrorFeedback(null);
    setPendingNext(null);
    setDirection(nextId > currentStepId ? 1 : -1);
    setCurrentStepId(nextId);

    if (option.status === 'success' && !option.nextId && onComplete) {
      onComplete(currentStep);
    }
  };

  const proceedAfterError = () => {
    if (pendingNext === null) return;
    setDirection(pendingNext > currentStepId ? 1 : -1);
    setCurrentStepId(pendingNext);
    setErrorFeedback(null);
    setPendingNext(null);
  };

  const resetError = () => {
    setErrorFeedback(null);
    setPendingNext(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep?.id}`}
          initial={{ opacity: 0, x: direction * 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 80 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border p-6 shadow-lg"
          style={{ background: currentStep?.color ?? '#0f172a' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-white/70 flex items-center gap-2">
              <Zap className="h-4 w-4 text-white/80" />
              PASSO {String(currentStep?.id ?? 0).padStart(2, '0')}
            </span>
            <span className="text-xs text-white/80">{currentStep?.title}</span>
          </div>
          <h3 className="mt-4 text-2xl font-black text-white">{currentStep?.question}</h3>
          {currentStep?.description && (
            <p className="mt-2 text-sm leading-relaxed text-white/80">{currentStep.description}</p>
          )}

          <div className="mt-6 grid gap-4">
            {currentStep?.options?.map((option) => (
              <motion.button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={
                  option.status === 'success'
                    ? { boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)' }
                    : option.status === 'error'
                    ? { boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)' }
                    : {}
                }
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 font-semibold text-white transition ${
                  option.status === 'success'
                    ? 'border-emerald-500 bg-emerald-500/80'
                    : option.status === 'error'
                    ? 'border-rose-500 bg-rose-600/80'
                    : 'border-white/60 bg-white/10'
                }`}
              >
                <span>{option.label}</span>
                {option.status === 'success' && <CheckCircle size={18} />}
                {option.status === 'error' && <AlertCircle size={18} />}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {errorFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-[#ef4444] bg-[#fee2e2] p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#b91c1c]">
            <AlertCircle size={16} />
            Alert Coral
          </div>
          <p className="mt-2 text-sm text-[#991b1b]">{errorFeedback}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={resetError}
              className="flex-1 rounded-full border border-[#ef4444] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#ef4444] transition hover:bg-[#ffe4e6]"
            >
              Tentar novamente
            </button>
            {pendingNext !== null && (
              <button
                onClick={proceedAfterError}
                className="flex-1 rounded-full bg-[#ef4444] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-[#dc2626]"
              >
                Avançar
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

