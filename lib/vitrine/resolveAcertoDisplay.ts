import { DESEMPENHO_MIN_SAMPLE } from '@/lib/desempenho/types';

/** Piso de amostra para exibir % de acerto na vitrine (mesmo do hub Desempenho). */
export const VITRINE_ACERTO_MIN_SAMPLE = DESEMPENHO_MIN_SAMPLE;

export type VitrineAcertoDisplayTone = 'muted' | 'brand' | 'success';

export type VitrineAcertoDisplay = {
  /** Texto hero (ex.: `67%`, `3/5 acertos`, `Não iniciado`). */
  label: string;
  ariaLabel: string;
  tone: VitrineAcertoDisplayTone;
  amostraSuficiente: boolean;
  /**
   * Valor 0–100 para anel/barra visual:
   * % de acerto com amostra suficiente; cobertura quando a amostra é baixa.
   */
  ringValue: number;
  /** Cobertura = respondidas ÷ total do assunto. */
  coberturaPct: number;
  /** Ex.: `12/40 respondidas`. */
  coberturaLabel: string;
};

export type ResolveAcertoDisplayInput = {
  acertos: number;
  totalResolvidas: number;
  totalQuestoes: number;
  /** % de acerto já agregado (acertos ÷ respondidas). */
  percentual: number;
};

/**
 * Hero da vitrine lidera por acerto (não por estudo reverso).
 * Amostra &lt; {@link VITRINE_ACERTO_MIN_SAMPLE}: contagem `acertos/respondidas`, sem %.
 */
export function resolveAcertoDisplay({
  acertos,
  totalResolvidas,
  totalQuestoes,
  percentual,
}: ResolveAcertoDisplayInput): VitrineAcertoDisplay {
  const coberturaPct =
    totalQuestoes > 0 ? Math.round((totalResolvidas / totalQuestoes) * 100) : 0;
  const coberturaLabel = `${totalResolvidas}/${totalQuestoes} respondidas`;
  const amostraSuficiente = totalResolvidas >= VITRINE_ACERTO_MIN_SAMPLE;

  if (totalResolvidas <= 0) {
    return {
      label: 'Não iniciado',
      ariaLabel: 'Nenhuma questão respondida',
      tone: 'muted',
      amostraSuficiente: false,
      ringValue: 0,
      coberturaPct,
      coberturaLabel,
    };
  }

  if (!amostraSuficiente) {
    return {
      label: `${acertos}/${totalResolvidas} acertos`,
      ariaLabel: `${acertos} de ${totalResolvidas} acertos`,
      tone: 'brand',
      amostraSuficiente: false,
      ringValue: coberturaPct,
      coberturaPct,
      coberturaLabel,
    };
  }

  const pct = Math.min(100, Math.max(0, Math.round(percentual)));
  return {
    label: `${pct}%`,
    ariaLabel: `${pct}% de acerto`,
    tone: pct >= 100 ? 'success' : 'brand',
    amostraSuficiente: true,
    ringValue: pct,
    coberturaPct,
    coberturaLabel,
  };
}
