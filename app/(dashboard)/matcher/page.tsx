 'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { generatePlan } from './actions'

export default function MatcherPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="h-full bg-slate-950 p-8">
      <Card className="border border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle>Editor de Editais: Matcher</CardTitle>
          <CardDescription>
            Cole um edital, protocolo ou edital COFEN e gere automaticamente um
            roteiro visual com base na IA do Gemini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={generatePlan}
            className="space-y-6"
            onSubmit={() => setLoading(true)}
          >
            <div className="space-y-2">
              <label
                htmlFor="planTitle"
                className="block text-sm font-medium text-slate-300"
              >
                Título do plano
              </label>
              <input
                id="planTitle"
                name="planTitle"
                placeholder="Ex: Concurso EBSERH 2026"
                className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="edital"
                className="block text-sm font-medium text-slate-300"
              >
                Texto do edital / protocolo
              </label>
              <textarea
                id="edital"
                name="edital"
                rows={8}
                required
                className="w-full resize-none rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Cole o conteúdo bruto aqui..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Gerando...' : 'Gerar Roteiro'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

