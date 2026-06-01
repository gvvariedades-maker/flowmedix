'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/ui/page-header';
import {
  formatRitmoMetaLabel,
  formatTempoMetaTotal,
  sessionDisplayTitulo,
} from '@/lib/simulado/provaMeta';
import type { SimuladoModo } from '@/lib/simulado/types';
import { cn } from '@/lib/utils';

export type SimuladoProvaInstrucoesProps = {
  titulo: string;
  modo: SimuladoModo;
  totalQuestoes: number;
  ritmoMetaSegundosPorQuestao: number | null;
  iniciandoProva: boolean;
  iniciarProvaError: string | null;
  onIniciar: () => void;
  className?: string;
};

const REGRAS = [
  'O gabarito só aparece após você finalizar o simulado.',
  'Depois de confirmar uma resposta, a alternativa fica travada — não é possível alterá-la.',
  'O cronômetro é ascendente e não pausa ao trocar de questão ou sair da tela.',
  'Atalhos: teclas A–E para marcar a alternativa; Enter para confirmar a resposta.',
] as const;

export function SimuladoProvaInstrucoes({
  titulo,
  modo,
  totalQuestoes,
  ritmoMetaSegundosPorQuestao,
  iniciandoProva,
  iniciarProvaError,
  onIniciar,
  className,
}: SimuladoProvaInstrucoesProps) {
  const [instrucoesLidas, setInstrucoesLidas] = useState(false);
  const checkboxId = useId();

  const tituloExibicao = sessionDisplayTitulo(titulo, modo);
  const ritmoLabel = formatRitmoMetaLabel(ritmoMetaSegundosPorQuestao);
  const metaTotalHms = formatTempoMetaTotal(totalQuestoes, ritmoMetaSegundosPorQuestao);

  return (
    <div className={cn('mx-auto max-w-lg space-y-6', className)}>
      <PageHeader
        title={tituloExibicao}
        breadcrumb={[
          { label: 'Simulados', href: '/simulados' },
          { label: 'Instruções' },
        ]}
        description={`${totalQuestoes} ${totalQuestoes === 1 ? 'questão' : 'questões'} · ritmo sugerido: ${ritmoLabel}`}
        descriptionClassName="text-sm text-slate-400 mt-1"
        titleClassName="text-xl font-[1000] italic tracking-tighter text-white sm:text-2xl"
      />

      <div className="glass-panel space-y-6 border border-white/10 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Sala de prova
          </h2>
          <p className="text-sm text-slate-300">
            Meta de tempo sugerida:{' '}
            <span className="font-mono font-medium text-cyan-300/90">
              {metaTotalHms ?? 'Sem meta'}
            </span>
            {metaTotalHms ? (
              <span className="text-slate-500"> ({ritmoLabel})</span>
            ) : null}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Regras
          </h3>
          <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-slate-300">
            {REGRAS.map((regra) => (
              <li key={regra}>{regra}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <Checkbox
            id={checkboxId}
            checked={instrucoesLidas}
            onCheckedChange={(checked) => setInstrucoesLidas(checked === true)}
            className="mt-0.5 border-white/25 bg-slate-900/80 data-[state=checked]:border-cyan-500 data-[state=checked]:bg-cyan-500"
            aria-describedby={`${checkboxId}-hint`}
          />
          <label htmlFor={checkboxId} className="cursor-pointer text-sm text-slate-200">
            Li as instruções e estou pronto para iniciar a prova.
            <span id={`${checkboxId}-hint`} className="mt-1 block text-xs text-slate-500">
              O cronômetro começa ao clicar em Iniciar prova.
            </span>
          </label>
        </div>

        {iniciarProvaError ? (
          <p className="text-sm text-rose-400" role="alert">
            {iniciarProvaError}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={!instrucoesLidas || iniciandoProva}
          onClick={onIniciar}
          className="h-12 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 disabled:opacity-40"
        >
          {iniciandoProva ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Iniciando…
            </>
          ) : (
            'Iniciar prova'
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-slate-600">
        <Link href="/simulados" className="transition-colors hover:text-slate-400">
          Voltar para Simulados
        </Link>
      </p>
    </div>
  );
}
