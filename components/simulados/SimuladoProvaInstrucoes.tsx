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
import type { SimuladoSessionKind } from '@/lib/simulado/sessionKind';
import { AdaptiveSimuladoSessionChip } from '@/components/simulados/AdaptiveSimuladoSessionChip';
import { cn } from '@/lib/utils';

export type SimuladoProvaInstrucoesProps = {
  titulo: string;
  modo: SimuladoModo;
  totalQuestoes: number;
  ritmoMetaSegundosPorQuestao: number | null;
  iniciandoProva: boolean;
  iniciarProvaError: string | null;
  onIniciar: () => void;
  sessionKind?: SimuladoSessionKind;
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
  sessionKind = 'livre',
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
        descriptionClassName="mt-1 text-sm text-slate-500"
        titleClassName="text-editorial-title text-xl sm:text-2xl"
      />
      {sessionKind !== 'livre' ? (
        <div className="-mt-4">
          <AdaptiveSimuladoSessionChip sessionKind={sessionKind} />
        </div>
      ) : null}

      <div className="card-elevated-lg space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Sala de prova
          </h2>
          <p className="text-sm text-slate-700">
            Meta de tempo sugerida:{' '}
            <span className="font-mono font-medium text-[#166534]">
              {metaTotalHms ?? 'Sem meta'}
            </span>
            {metaTotalHms ? (
              <span className="text-slate-500"> ({ritmoLabel})</span>
            ) : null}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Regras
          </h3>
          <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-slate-700">
            {REGRAS.map((regra) => (
              <li key={regra}>{regra}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Checkbox
            id={checkboxId}
            checked={instrucoesLidas}
            onCheckedChange={(checked) => setInstrucoesLidas(checked === true)}
            className="mt-0.5 border-slate-300 data-[state=checked]:border-[#22c55e] data-[state=checked]:bg-[#22c55e]"
            aria-describedby={`${checkboxId}-hint`}
          />
          <label htmlFor={checkboxId} className="cursor-pointer text-sm text-slate-800">
            Li as instruções e estou pronto para iniciar a prova.
            <span id={`${checkboxId}-hint`} className="mt-1 block text-xs text-slate-500">
              O cronômetro começa ao clicar em Iniciar prova.
            </span>
          </label>
        </div>

        {iniciarProvaError ? (
          <p className="text-sm text-rose-600" role="alert">
            {iniciarProvaError}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={!instrucoesLidas || iniciandoProva}
          onClick={onIniciar}
          className="btn-editorial-primary h-12 w-full disabled:opacity-40"
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

      <p className="text-center text-xs text-slate-500">
        <Link href="/simulados" className="link-editorial-secondary transition-colors">
          Voltar para Simulados
        </Link>
      </p>
    </div>
  );
}
