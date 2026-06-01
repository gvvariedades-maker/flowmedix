import type { SimuladoQuestaoItem } from '@/lib/simulado/types';
import { isSimuladoQuestaoRespondida } from '@/lib/simulado/types';

export type EixoDiagnostico = {
  eixo: string;
  erros: number;
  total: number;
};

export function resolveEixoTematico(meta: SimuladoQuestaoItem['meta']): string {
  return meta.subtopico?.trim() || meta.topico?.trim() || 'Outros';
}

export function agruparErrosPorEixo(questoes: SimuladoQuestaoItem[]): EixoDiagnostico[] {
  const map = new Map<string, { erros: number; total: number }>();

  for (const questao of questoes) {
    if (!isSimuladoQuestaoRespondida(questao)) continue;

    const eixo = resolveEixoTematico(questao.meta);
    const acc = map.get(eixo) ?? { erros: 0, total: 0 };
    acc.total += 1;
    if (!questao.acertou) acc.erros += 1;
    map.set(eixo, acc);
  }

  return Array.from(map.entries())
    .map(([eixo, stats]) => ({ eixo, ...stats }))
    .filter((item) => item.erros > 0)
    .sort((a, b) => b.erros - a.erros || a.eixo.localeCompare(b.eixo, 'pt-BR'))
    .slice(0, 3);
}

export function resolveDiagnosticoBancaLabel(
  filtros: Record<string, unknown>,
  questoes: SimuladoQuestaoItem[],
): string | null {
  const bancasFiltro = Array.isArray(filtros.bancas)
    ? filtros.bancas.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

  if (bancasFiltro.length === 1) return bancasFiltro[0]!;

  const counts = new Map<string, number>();
  for (const questao of questoes) {
    if (!isSimuladoQuestaoRespondida(questao)) continue;
    const banca = questao.meta.banca?.trim();
    if (!banca) continue;
    counts.set(banca, (counts.get(banca) ?? 0) + 1);
  }

  if (counts.size === 0) return null;

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

export function buildDiagnosticoRodape(bancaLabel: string | null): string {
  if (bancaLabel) {
    return `Esses são os eixos com mais erros — priorize o que a ${bancaLabel} mais cobra.`;
  }
  return 'Esses são os eixos com mais erros neste simulado.';
}
