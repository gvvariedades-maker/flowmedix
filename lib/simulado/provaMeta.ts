import type { SimuladoModo } from '@/lib/simulado/types';

export type RitmoMetaOption = '2min' | '3min' | 'none';

export function ritmoToSecondsPerQuestion(ritmo: RitmoMetaOption): number | null {
  if (ritmo === '2min') return 120;
  if (ritmo === '3min') return 180;
  return null;
}

export function buildDefaultTitulo(params: {
  bancas?: string[];
  assuntos?: string[];
  quantidade: number;
  modo: SimuladoModo;
}): string {
  const parts: string[] = [params.modo === 'prova' ? 'Prova' : 'Treino'];

  if (params.bancas?.length === 1) {
    parts.push(params.bancas[0]!);
  } else if (params.bancas && params.bancas.length > 1) {
    parts.push(`${params.bancas.length} bancas`);
  }

  if (params.assuntos?.length === 1) {
    parts.push(params.assuntos[0]!);
  } else if (params.assuntos && params.assuntos.length > 1) {
    parts.push(`${params.assuntos.length} assuntos`);
  }

  parts.push(
    `${params.quantidade} ${params.quantidade === 1 ? 'questão' : 'questões'}`,
    new Date().toLocaleDateString('pt-BR'),
  );

  return parts.join(' · ');
}

export function computeTempoMetaSegundos(
  quantidade: number,
  segundosPorQuestao: number | null,
): number | null {
  if (segundosPorQuestao == null || quantidade <= 0) return null;
  return quantidade * segundosPorQuestao;
}

export function formatRitmoMetaLabel(
  ritmoMetaSegundosPorQuestao: number | null | undefined,
): string {
  if (ritmoMetaSegundosPorQuestao == null) return 'Sem meta';
  const minutos = Math.round(ritmoMetaSegundosPorQuestao / 60);
  return `${minutos} min/questão`;
}

export function sessionDisplayTitulo(
  titulo: string | null | undefined,
  modo: SimuladoModo,
): string {
  const trimmed = titulo?.trim();
  if (trimmed) return trimmed;
  return modo === 'prova' ? 'Prova' : 'Simulado · Treino';
}

/** Formata milissegundos decorridos como HH:MM:SS (sempre não negativo). */
export function formatElapsedHms(totalMs: number): string {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function formatTempoMetaTotal(
  totalQuestoes: number,
  ritmoMetaSegundosPorQuestao: number | null | undefined,
): string | null {
  const totalSec = computeTempoMetaSegundos(
    totalQuestoes,
    ritmoMetaSegundosPorQuestao ?? null,
  );
  if (totalSec == null) return null;
  return formatElapsedHms(totalSec * 1000);
}

export function secondsPerQuestionToRitmo(
  ritmoMetaSegundosPorQuestao: number | null | undefined,
): RitmoMetaOption {
  if (ritmoMetaSegundosPorQuestao === 120) return '2min';
  if (ritmoMetaSegundosPorQuestao === 180) return '3min';
  return 'none';
}

const TENTATIVA_SUFFIX_RE = / — tentativa (\d+)$/i;

/** Sugere título para nova tentativa: `{base} — tentativa N` (incrementa se já existir). */
export function buildRetryTitulo(titulo: string): string {
  const trimmed = titulo.trim() || 'Prova';
  const match = trimmed.match(TENTATIVA_SUFFIX_RE);
  if (match) {
    const base = trimmed.slice(0, match.index).trim() || 'Prova';
    const next = Number.parseInt(match[1]!, 10) + 1;
    return `${base} — tentativa ${next}`;
  }
  return `${trimmed} — tentativa 2`;
}

export function formatDurationFriendly(totalMs: number): string {
  const totalMin = Math.max(0, Math.round(totalMs / 60_000));
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export type ProvaTempoVsMetaStatus = 'within' | 'above' | 'no_meta';

export type ProvaTempoVsMeta = {
  status: ProvaTempoVsMetaStatus;
  tempoLabel: string;
  metaLabel: string | null;
  comparacaoLabel: string;
};

export function evaluateProvaTempoVsMeta(
  tempoTotalMs: number,
  totalQuestoes: number,
  ritmoMetaSegundosPorQuestao: number | null | undefined,
): ProvaTempoVsMeta {
  const tempoLabel = formatDurationFriendly(tempoTotalMs);
  const metaSec = computeTempoMetaSegundos(
    totalQuestoes,
    ritmoMetaSegundosPorQuestao ?? null,
  );

  if (metaSec == null) {
    return {
      status: 'no_meta',
      tempoLabel,
      metaLabel: null,
      comparacaoLabel: 'Sem meta de tempo',
    };
  }

  const metaLabel = formatDurationFriendly(metaSec * 1000);
  const metaMs = metaSec * 1000;

  if (tempoTotalMs <= metaMs) {
    return {
      status: 'within',
      tempoLabel,
      metaLabel,
      comparacaoLabel: 'Dentro da meta',
    };
  }

  const deltaMin = Math.max(1, Math.ceil((tempoTotalMs - metaMs) / 60_000));
  return {
    status: 'above',
    tempoLabel,
    metaLabel,
    comparacaoLabel: `Acima da meta em ${deltaMin} min`,
  };
}
