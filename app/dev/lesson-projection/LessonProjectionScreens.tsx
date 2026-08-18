import { Check, X } from 'lucide-react';

import type { LessonProjection, ProvaScreen } from '@/lib/lesson/lessonProjection';

type Props = {
  projection: LessonProjection;
  /** Letra com que o aluno já se comprometeu (query `?escolha=`). */
  escolha: string | null;
  /** Só depois do compromisso; antes disso nem chega ao componente. */
  gabarito: string | null;
  hrefForEscolha: (optionId: string) => string;
};

/**
 * Duas telas do experimento F7. A eliminação, os cards e a fixação são renderizados
 * **no servidor** só depois do compromisso — antes disso a resposta não existe no
 * payload da página, não só na tela.
 */
export function LessonProjectionScreens({ projection, escolha, gabarito, hrefForEscolha }: Props) {
  const { aula, prova } = projection;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Aula</h2>
        {aula.title ? <p className="mb-3 text-base font-medium text-slate-900">{aula.title}</p> : null}

        <ul className="space-y-2">
          {aula.enquadramento.map((frame) => (
            <li key={frame.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{frame.label}</p>
              {frame.detail ? <p className="text-sm text-slate-600">{frame.detail}</p> : null}
            </li>
          ))}
        </ul>

        {aula.referencia.length > 0 ? (
          <table className="mt-4 w-full text-sm">
            <tbody>
              {aula.referencia.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-700">
                    {row.label}
                  </th>
                  <td className="py-2 text-slate-600">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {aula.regra ? <p className="mt-4 text-sm font-medium text-slate-800">{aula.regra}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Prova</h2>
        <p className="text-sm text-slate-900">{prova.prediction_gate.prompt}</p>

        <ul className="mt-3 space-y-2">
          {prova.prediction_gate.options.map((option) => {
            const escolhida = escolha === option.id;
            return (
              <li key={option.id}>
                <a
                  href={hrefForEscolha(option.id)}
                  aria-current={escolhida ? 'true' : undefined}
                  className={`block rounded-xl border p-3 text-sm transition ${
                    escolhida
                      ? 'border-cyan-500 bg-cyan-50 text-slate-900'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="mr-2 font-semibold">{option.id}</span>
                  {option.text}
                </a>
              </li>
            );
          })}
        </ul>

        {escolha === null ? (
          <p className="mt-4 text-sm text-slate-500" data-testid="lesson-projection-gate">
            Escolha uma letra para liberar a eliminação — o compromisso vem antes da resposta.
          </p>
        ) : (
          <ProvaReveal prova={prova} escolha={escolha} gabarito={gabarito} />
        )}
      </section>
    </div>
  );
}

function ProvaReveal({
  prova,
  escolha,
  gabarito,
}: {
  prova: ProvaScreen;
  escolha: string;
  gabarito: string | null;
}) {
  return (
    <div className="mt-5 space-y-5" data-testid="lesson-projection-reveal">
      <p className="text-sm text-slate-600">
        Você marcou <strong>{escolha}</strong>
        {gabarito ? ` · gabarito ${gabarito}` : ''}
      </p>

      <ol className="space-y-2">
        {prova.elimination.map((step) => (
          <li
            key={step.text}
            className={`rounded-xl p-3 text-sm ${
              step.kind === 'gabarito' ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-700'
            }`}
          >
            {step.text}
          </li>
        ))}
      </ol>

      <ul className="space-y-2">
        {prova.distractor_cards.map((card) => (
          <li key={card.label} className="rounded-xl border border-slate-200 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              {card.polarity === 'trap' ? (
                <X className="h-4 w-4 text-rose-600" aria-hidden />
              ) : (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden />
              )}
              {card.label}
            </p>
            {card.trap ? <p className="mt-1 text-sm text-slate-600">{card.trap}</p> : null}
            {card.correct ? <p className="mt-1 text-sm text-emerald-800">{card.correct}</p> : null}
          </li>
        ))}
      </ul>

      {prova.fixacao.transfer.length > 0 ? (
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Fixação</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {prova.fixacao.transfer.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
