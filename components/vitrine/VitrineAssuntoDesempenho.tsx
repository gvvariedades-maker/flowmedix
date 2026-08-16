import { AcertoErroDonut } from '@/components/vitrine/AcertoErroDonut';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import { labelQuestoes } from '@/lib/labelQuestoes';
import { cn } from '@/lib/utils';
import {
  resolveAcertoDisplay,
  splitAcertoErroPct,
} from '@/lib/vitrine/resolveAcertoDisplay';

export type VitrineAssuntoDesempenhoProps = {
  acertos: number;
  erros: number;
  respondidas: number;
  totalQuestoes: number;
  percentual?: number;
};

export function VitrineAssuntoDesempenho({
  acertos,
  erros,
  respondidas,
  totalQuestoes,
  percentual = 0,
}: VitrineAssuntoDesempenhoProps) {
  const display = resolveAcertoDisplay({
    acertos,
    totalResolvidas: respondidas,
    totalQuestoes,
    percentual,
  });
  const { acertoPct, erroPct } = splitAcertoErroPct(acertos, respondidas);
  const naoRespondidas = Math.max(0, totalQuestoes - respondidas);
  const hasAnswers = respondidas > 0;

  return (
    <div className="space-y-5">
      <section className="space-y-3" aria-labelledby="vitrine-assunto-desempenho-heading">
        <h3
          id="vitrine-assunto-desempenho-heading"
          className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
        >
          Seu desempenho
        </h3>

        <AcertoErroDonut
          acertos={acertos}
          erros={erros}
          respondidas={respondidas}
          size={120}
          strokeWidth={14}
        />

        {hasAnswers ? (
          <>
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px]">
              <li className="font-medium tabular-nums text-[var(--color-success-text)]">
                {acertos} {acertos === 1 ? 'acerto' : 'acertos'} — {acertoPct}%
              </li>
              <li className="font-medium tabular-nums text-[var(--color-danger-text)]">
                {erros} {erros === 1 ? 'erro' : 'erros'} — {erroPct}%
              </li>
            </ul>
            <p className="text-center text-[11px] text-slate-500">
              Diagnóstico baseado nas questões respondidas
            </p>
          </>
        ) : null}
      </section>

      {totalQuestoes > 0 ? (
        <section className="space-y-2" aria-labelledby="vitrine-assunto-progresso-heading">
          <h3
            id="vitrine-assunto-progresso-heading"
            className="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
          >
            Progresso no assunto
          </h3>
          <div className="flex items-baseline justify-between gap-3 text-[12px]">
            <p className="min-w-0 font-medium tabular-nums text-slate-800">
              {display.coberturaLabel}
            </p>
            <p
              className={cn('shrink-0 font-semibold tabular-nums', vitrineBrand.text)}
              aria-label={`Cobertura: ${display.coberturaPct}%`}
            >
              {display.coberturaPct}%
            </p>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={display.coberturaPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Cobertura do assunto: ${display.coberturaLabel}`}
          >
            {display.coberturaPct > 0 ? (
              <div
                className={cn('h-full rounded-full transition-[width] duration-300 ease-out', vitrineBrand.bar)}
                style={{ width: `${Math.min(100, display.coberturaPct)}%` }}
              />
            ) : null}
          </div>
          {naoRespondidas > 0 ? (
            <p className="text-[11px] text-slate-500">
              {naoRespondidas.toLocaleString('pt-BR')} {labelQuestoes(naoRespondidas)} ainda não
              respondidas
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">Todas as questões deste assunto foram respondidas</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
