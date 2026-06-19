import { resolveEixoTematico } from '@/lib/simulado/diagnosticoEixos';
import type { SimuladoSessionKind } from '@/lib/simulado/sessionKind';
import type { SimuladoQuestaoItem } from '@/lib/simulado/types';
import { isSimuladoQuestaoRespondida } from '@/lib/simulado/types';
import { isWeeklySimuladoFiltros } from '@/lib/simulado/weeklySimuladoCore';

export const META_SEMANAL_SESSOES_LIVRE = 3;

export type ConclusaoSessionRow = {
  concluida_em: string | null;
  created_at: string;
  filtros?: Record<string, unknown> | null;
};

export type EixoDesempenho = {
  eixo: string;
  acertos: number;
  erros: number;
  total: number;
  percentual_acerto: number | null;
};

export type HistoricoEixoDesempenho = {
  eixo: string;
  acertos: number;
  total: number;
  percentual_acerto: number | null;
};

export type SimuladoEixoEvolucaoItem = {
  eixo: string;
  percentual_anterior: number;
  percentual_atual: number;
  delta_pontos: number;
  mensagem: string;
};

export type SimuladoDominioPegadinha = {
  eixo: string;
  quantidade: number;
  mensagem: string;
};

export type SimuladoConclusaoStreakIncentivo = {
  streak_atual_dias: number;
  semanas_consecutivas_simulado: number;
  meta_semanal_atingida: boolean;
  mensagem: string | null;
  badge: 'streak_dias' | 'streak_semanas' | 'meta_semanal' | null;
};

export type SimuladoConclusaoIncentivos = {
  eixos_evolucao: SimuladoEixoEvolucaoItem[];
  dominios: SimuladoDominioPegadinha[];
  streak: SimuladoConclusaoStreakIncentivo;
  mensagens_destaque: string[];
};

function calculatePercentual(acertos: number, total: number): number | null {
  if (total <= 0) return null;
  return Number(((acertos / total) * 100).toFixed(0));
}

export function agruparDesempenhoPorEixo(questoes: SimuladoQuestaoItem[]): EixoDesempenho[] {
  const map = new Map<string, { acertos: number; erros: number; total: number }>();

  for (const questao of questoes) {
    if (!isSimuladoQuestaoRespondida(questao)) continue;

    const eixo = resolveEixoTematico(questao.meta);
    const acc = map.get(eixo) ?? { acertos: 0, erros: 0, total: 0 };
    acc.total += 1;
    if (questao.acertou) acc.acertos += 1;
    else acc.erros += 1;
    map.set(eixo, acc);
  }

  return Array.from(map.entries())
    .map(([eixo, stats]) => ({
      eixo,
      ...stats,
      percentual_acerto: calculatePercentual(stats.acertos, stats.total),
    }))
    .sort((a, b) => a.eixo.localeCompare(b.eixo, 'pt-BR'));
}

export function computeEixosEvolucao(
  atual: EixoDesempenho[],
  historico: HistoricoEixoDesempenho[],
  options?: { minHistoricoTotal?: number; minDelta?: number; maxItems?: number },
): SimuladoEixoEvolucaoItem[] {
  const minHistoricoTotal = options?.minHistoricoTotal ?? 3;
  const minDelta = options?.minDelta ?? 5;
  const maxItems = options?.maxItems ?? 3;

  const historicoMap = new Map(historico.map((item) => [item.eixo, item]));
  const result: SimuladoEixoEvolucaoItem[] = [];

  for (const item of atual) {
    const prev = historicoMap.get(item.eixo);
    if (!prev || prev.total < minHistoricoTotal) continue;
    if (item.percentual_acerto === null || prev.percentual_acerto === null) continue;

    const delta = item.percentual_acerto - prev.percentual_acerto;
    if (delta < minDelta) continue;

    result.push({
      eixo: item.eixo,
      percentual_anterior: prev.percentual_acerto,
      percentual_atual: item.percentual_acerto,
      delta_pontos: delta,
      mensagem: `Esta semana você subiu seu nível de precisão em ${item.eixo} de ${prev.percentual_acerto}% para ${item.percentual_acerto}%!`,
    });
  }

  return result.sort((a, b) => b.delta_pontos - a.delta_pontos).slice(0, maxItems);
}

export type PadraoErroHistorico = {
  eixo: string;
  total_questoes: number;
  taxa_erro: number | null;
};

export function computeDominiosPegadinhas(
  questoes: SimuladoQuestaoItem[],
  padroesErro: PadraoErroHistorico[],
  options?: { minHistoricoTotal?: number; minTaxaErro?: number },
): SimuladoDominioPegadinha[] {
  const minHistoricoTotal = options?.minHistoricoTotal ?? 2;
  const minTaxaErro = options?.minTaxaErro ?? 40;

  const fracos = new Map(
    padroesErro
      .filter(
        (item) =>
          item.total_questoes >= minHistoricoTotal &&
          item.taxa_erro !== null &&
          item.taxa_erro >= minTaxaErro,
      )
      .map((item) => [item.eixo, item]),
  );

  if (fracos.size === 0) return [];

  const dominiosMap = new Map<string, number>();

  for (const questao of questoes) {
    if (!isSimuladoQuestaoRespondida(questao) || !questao.acertou) continue;
    const eixo = resolveEixoTematico(questao.meta);
    if (!fracos.has(eixo)) continue;
    dominiosMap.set(eixo, (dominiosMap.get(eixo) ?? 0) + 1);
  }

  return Array.from(dominiosMap.entries())
    .filter(([, quantidade]) => quantidade > 0)
    .map(([eixo, quantidade]) => ({
      eixo,
      quantidade,
      mensagem:
        quantidade === 1
          ? `Você acertou uma questão que costumava errar em ${eixo}!`
          : `Você dominou ${quantidade} pegadinhas que costumava errar em ${eixo}!`,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 3);
}

export function getIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function computeSemanasConsecutivasSimulado(
  concluidasEm: string[],
  now: Date = new Date(),
): number {
  if (concluidasEm.length === 0) return 0;

  const weekSet = new Set(concluidasEm.map((iso) => getIsoWeekKey(new Date(iso))));
  let streak = 0;
  let cursor = new Date(now);

  while (weekSet.has(getIsoWeekKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 7 * 86_400_000);
  }

  return streak;
}

export function buildStreakIncentivo(input: {
  streak_atual_dias: number;
  semanas_consecutivas: number;
  meta_semanal_atingida: boolean;
}): SimuladoConclusaoStreakIncentivo {
  const { streak_atual_dias, semanas_consecutivas, meta_semanal_atingida } = input;

  if (semanas_consecutivas >= 2) {
    return {
      streak_atual_dias,
      semanas_consecutivas_simulado: semanas_consecutivas,
      meta_semanal_atingida,
      badge: 'streak_semanas',
      mensagem: `${semanas_consecutivas} semanas seguidas concluindo simulado — consistência de campeão!`,
    };
  }

  if (meta_semanal_atingida) {
    return {
      streak_atual_dias,
      semanas_consecutivas_simulado: semanas_consecutivas,
      meta_semanal_atingida,
      badge: 'meta_semanal',
      mensagem: 'Meta semanal de simulados atingida — continue nesse ritmo!',
    };
  }

  if (streak_atual_dias >= 3) {
    return {
      streak_atual_dias,
      semanas_consecutivas_simulado: semanas_consecutivas,
      meta_semanal_atingida,
      mensagem: `${streak_atual_dias} dias seguidos estudando com simulados!`,
      badge: 'streak_dias',
    };
  }

  return {
    streak_atual_dias,
    semanas_consecutivas_simulado: semanas_consecutivas,
    meta_semanal_atingida,
    mensagem: null,
    badge: null,
  };
}

export function resolveConclusaoMetaParams(input: {
  sessionKind: SimuladoSessionKind;
  sessions: ConclusaoSessionRow[];
  now?: Date;
}): { meta_semanal_atingida: boolean; semanas_consecutivas: number } {
  const { sessionKind, sessions, now = new Date() } = input;

  const concluidasEm = sessions
    .map((row) => row.concluida_em)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);

  if (sessionKind === 'weekly') {
    const weeklyConcluidasEm = sessions
      .filter((row) => isWeeklySimuladoFiltros(row.filtros))
      .map((row) => row.concluida_em)
      .filter((value): value is string => typeof value === 'string' && value.length > 0);

    return {
      meta_semanal_atingida: true,
      semanas_consecutivas: computeSemanasConsecutivasSimulado(weeklyConcluidasEm, now),
    };
  }

  if (sessionKind === 'diagnostico') {
    return { meta_semanal_atingida: false, semanas_consecutivas: 0 };
  }

  const weeklyThreshold = new Date(now);
  weeklyThreshold.setDate(weeklyThreshold.getDate() - 7);

  const weeklySessions = sessions.filter((row) => {
    const baseDate = new Date(row.concluida_em ?? row.created_at);
    return baseDate >= weeklyThreshold;
  }).length;

  return {
    meta_semanal_atingida: weeklySessions >= META_SEMANAL_SESSOES_LIVRE,
    semanas_consecutivas: computeSemanasConsecutivasSimulado(concluidasEm, now),
  };
}

function isGenericSimuladoStreakMessage(message: string): boolean {
  return (
    message.includes('Meta semanal de simulados') ||
    message.includes('semanas seguidas concluindo simulado')
  );
}

export function applyAdaptiveIncentivoMessages(
  sessionKind: SimuladoSessionKind,
  incentivos: SimuladoConclusaoIncentivos,
): SimuladoConclusaoIncentivos {
  if (sessionKind === 'weekly') {
    const semanasMissao = incentivos.streak.semanas_consecutivas_simulado;
    const missionMessage =
      semanasMissao >= 2
        ? `${semanasMissao} semanas seguidas concluindo a missão — consistência de campeão!`
        : 'Missão da semana concluída — parabéns!';

    const filteredDestaque = incentivos.mensagens_destaque.filter(
      (message) => !isGenericSimuladoStreakMessage(message),
    );

    return {
      ...incentivos,
      streak: {
        ...incentivos.streak,
        meta_semanal_atingida: true,
        badge: semanasMissao >= 2 ? 'streak_semanas' : 'meta_semanal',
        mensagem: missionMessage,
      },
      mensagens_destaque: [
        'Missão da semana concluída',
        ...(semanasMissao >= 2 ? [`${semanasMissao} semanas seguidas com missão feita!`] : []),
        ...filteredDestaque,
      ].slice(0, 5),
    };
  }

  if (sessionKind === 'diagnostico') {
    const filteredDestaque = incentivos.mensagens_destaque.filter(
      (message) => !isGenericSimuladoStreakMessage(message),
    );

    return {
      ...incentivos,
      streak: {
        ...incentivos.streak,
        meta_semanal_atingida: false,
        badge: null,
        mensagem: null,
      },
      mensagens_destaque: [
        'Diagnóstico concluído — seu mapa de partida para o plano de estudos.',
        ...filteredDestaque,
      ].slice(0, 5),
    };
  }

  return incentivos;
}

export function buildConclusaoIncentivos(input: {
  questoes: SimuladoQuestaoItem[];
  historicoEixos: HistoricoEixoDesempenho[];
  padroesErro: PadraoErroHistorico[];
  streak_atual_dias: number;
  semanas_consecutivas: number;
  meta_semanal_atingida: boolean;
}): SimuladoConclusaoIncentivos {
  const desempenhoAtual = agruparDesempenhoPorEixo(input.questoes);
  const eixos_evolucao = computeEixosEvolucao(desempenhoAtual, input.historicoEixos);
  const dominios = computeDominiosPegadinhas(input.questoes, input.padroesErro);
  const streak = buildStreakIncentivo({
    streak_atual_dias: input.streak_atual_dias,
    semanas_consecutivas: input.semanas_consecutivas,
    meta_semanal_atingida: input.meta_semanal_atingida,
  });

  const mensagens_destaque = [
    ...eixos_evolucao.map((item) => item.mensagem),
    ...dominios.map((item) => item.mensagem),
    ...(streak.mensagem ? [streak.mensagem] : []),
  ].slice(0, 5);

  return {
    eixos_evolucao,
    dominios,
    streak,
    mensagens_destaque,
  };
}
