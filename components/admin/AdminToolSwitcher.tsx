'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, FileText } from 'lucide-react'

import { VerticalExamBuilder } from './VerticalExamBuilder'
import { SimulatorAdminPanel } from './SimulatorAdminPanel'

type Tool = {
  id: 'editor' | 'verticalizador'
  label: string
  description: string
  Icon: typeof LayoutDashboard | typeof FileText
}

const tools: Tool[] = [
  {
    id: 'editor',
    label: 'Editor FlowMedix',
    description: 'Monte fluxogramas, publique simuladores e revise módulos.',
    Icon: LayoutDashboard,
  },
  {
    id: 'verticalizador',
    label: 'Verticalizar Conteúdo',
    description: 'Transforme editais em cronogramas com sugestões inteligentes.',
    Icon: FileText,
  },
]

export function AdminToolSwitcher() {
  const [activeTool, setActiveTool] = useState<'editor' | 'verticalizador'>('verticalizador')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id
          const Icon = tool.Icon
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${
                isActive
                  ? 'border-clinical-accent bg-[#0b111a] shadow-neon-cyan'
                  : 'border-white/10 opacity-50 hover:opacity-100'
              }`}
            >
              <Icon className="h-5 w-5 text-clinical-accent" />
              <span>{tool.label}</span>
            </button>
          )
        })}
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-3xl border border-slate-800 bg-gradient-to-br from-[#020409] to-[#050815] opacity-80" />
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTool === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-sm uppercase tracking-[0.3em] text-clinical-muted">
                  Editor FlowMedix
                </h3>
                <p className="text-sm text-clinical-muted mb-6">
                  Monte, valide e publique simuladores com o seu fluxo favorito.
                </p>
                <SimulatorAdminPanel />
              </motion.div>
            ) : (
              <motion.div
                key="verticalizador"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-sm uppercase tracking-[0.3em] text-clinical-muted">
                  Gerador de Editais Verticalizados
                </h3>
                <p className="text-sm text-clinical-muted mb-6">
                  Use IA e sugestões inteligentes para distribuir o seu edital em módulos já existentes.
                </p>
                <VerticalExamBuilder />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}










