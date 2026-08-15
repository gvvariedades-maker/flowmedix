export type VitrineAcertoDisplayTone = 'muted' | 'success';

export type VitrineAcertoDisplay = {
  /** Texto hero (ex.: `67%`, `Não iniciado`). */
  label: string;
  ariaLabel: string;
  tone: VitrineAcertoDisplayTone;
  /** % de acerto 0–100; `null` sem respondidas (não há denominador). */
  acertoPct: number | null;
  /** Cobertura = respondidas ÷ total do assunto. */
  coberturaPct: number;
  /** Ex.: `12 de 40 respondidas`. */
  coberturaLabel: string;
};

export type ResolveAcertoDisplayInput = {
  acertos: number;
  totalResolvidas: number;
  totalQuestoes: number;
  /** % de acerto já agregado (acertos ÷ respondidas). */
  percentual: number;
};

export type AcertoErroPctSplit = {
  acertoPct: number;
  erroPct: number;
};

/**
 * Fatias do donut: arredonda acerto e atribui o resto ao erro para somar 100.
 * Sem respondidas: 0/0 (trilho cinza, sem fatias).
 */
export function splitAcertoErroPct(
  acertos: number,
  respondidas: number,
): AcertoErroPctSplit {
  if (respondidas <= 0) return { acertoPct: 0, erroPct: 0 };
  const safeAcertos = Math.min(Math.max(0, acertos), respondidas);
  const acertoPct = Math.min(100, Math.max(0, Math.round((safeAcertos / respondidas) * 100)));
  return { acertoPct, erroPct: 100 - acertoPct };
}

function pluralize(count: number, singular: string, plural: string): string {
  return Math.abs(count) === 1 ? singular : plural;
}

/**
 * Descrição acessível do donut (não depende só da cor).
 * Ex.: `Taxa de acerto: 8%. 1 acerto e 12 erros entre 13 respondidas.`
 */
export function formatAcertoErroAria(
  acertos: number,
  erros: number,
  respondidas: number,
  acertoPct: number,
): string {
  const acertoWord = pluralize(acertos, 'acerto', 'acertos');
  const erroWord = pluralize(erros, 'erro', 'erros');
  return `Taxa de acerto: ${acertoPct}%. ${acertos} ${acertoWord} e ${erros} ${erroWord} entre ${respondidas} respondidas.`;
}

/**
 * Hero da vitrine lidera por acerto (não por cobertura).
 * Com ≥ 1 respondida mostra % sempre — inclusive 0% — com tom de acerto.
 */
export function resolveAcertoDisplay({
  acertos,
  totalResolvidas,
  totalQuestoes,
}: ResolveAcertoDisplayInput): VitrineAcertoDisplay {
  const coberturaPct =
    totalQuestoes > 0 ? Math.round((totalResolvidas / totalQuestoes) * 100) : 0;
  const coberturaLabel = `${totalResolvidas} de ${totalQuestoes} respondidas`;

  if (totalResolvidas <= 0) {
    return {
      label: 'Não iniciado',
      ariaLabel: 'Nenhuma questão respondida',
      tone: 'muted',
      acertoPct: null,
      coberturaPct,
      coberturaLabel,
    };
  }

  const acertoPct = splitAcertoErroPct(acertos, totalResolvidas).acertoPct;

  return {
    label: `${acertoPct}%`,
    ariaLabel: `${acertoPct}% de acerto`,
    tone: 'success',
    acertoPct,
    coberturaPct,
    coberturaLabel,
  };
}
