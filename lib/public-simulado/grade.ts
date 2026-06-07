import { findCorrectOptionId } from '@/lib/estudar/questionPayload';
import type { LessonData } from '@/types/lesson';
import type { PublicSimuladoAnswerRecord } from '@/lib/public-simulado/types';

export function resolveEixoFromLesson(dados: LessonData): string {
  return (
    dados.meta?.subtopico?.trim() ||
    dados.meta?.topico?.trim() ||
    'Outros'
  );
}

export function gradePublicSimuladoAnswer(
  dados: LessonData,
  opcaoId: string,
): { acertou: boolean; opcaoCorretaId: string } | null {
  const opcaoCorretaId = findCorrectOptionId(dados);
  if (!opcaoCorretaId) return null;
  const validIds = dados.question_data.options.map((o) => o.id);
  if (!validIds.includes(opcaoId)) return null;
  return { acertou: opcaoId === opcaoCorretaId, opcaoCorretaId };
}

export type EixoDiagnosticoPublic = {
  eixo: string;
  erros: number;
  total: number;
};

export function buildPublicSimuladoDiagnostico(
  records: PublicSimuladoAnswerRecord[],
): EixoDiagnosticoPublic[] {
  const map = new Map<string, { erros: number; total: number }>();
  for (const r of records) {
    const acc = map.get(r.eixo) ?? { erros: 0, total: 0 };
    acc.total += 1;
    if (!r.acertou) acc.erros += 1;
    map.set(r.eixo, acc);
  }
  return [...map.entries()]
    .map(([eixo, stats]) => ({ eixo, ...stats }))
    .filter((item) => item.erros > 0)
    .sort((a, b) => b.erros - a.erros || a.eixo.localeCompare(b.eixo, 'pt-BR'));
}

export function buildPublicSimuladoUtm(manifestCampaign: string, medium = 'whatsapp'): string {
  return `utm_source=simulado&utm_medium=${medium}&utm_campaign=${encodeURIComponent(manifestCampaign)}`;
}
