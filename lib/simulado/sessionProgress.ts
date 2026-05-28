import type {
  SimuladoModo,
  SimuladoQuestaoMeta,
  SimuladoQuestaoRespondida,
  SimuladoResumo,
  SimuladoSessionStatus,
} from '@/lib/simulado/types';

export type SimuladoRespostaProgressRow = {
  ordem: number;
  modulo_slug: string;
  opcao_id: string | null;
  opcao_correta_id: string | null;
  acertou: boolean | null;
  respondida_em: string | null;
  tempo_ms: number | null;
  modulos_estudo?:
    | {
        banca: string | null;
        titulo_aula: string | null;
        modulo_nome: string | null;
      }
    | Array<{
        banca: string | null;
        titulo_aula: string | null;
        modulo_nome: string | null;
      }>
    | null;
};

type ModuloEstudoBase = {
  banca: string | null;
  titulo_aula: string | null;
  modulo_nome: string | null;
};

function normalizeModuloEstudoEmbed(
  raw: SimuladoRespostaProgressRow['modulos_estudo'],
): ModuloEstudoBase | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

export function extractQuestaoMetaFromModulo(
  moduloEmbed: SimuladoRespostaProgressRow['modulos_estudo'],
): SimuladoQuestaoMeta {
  const modulo = normalizeModuloEstudoEmbed(moduloEmbed);
  return {
    banca: modulo?.banca ?? null,
    topico: modulo?.modulo_nome ?? null,
    subtopico: modulo?.titulo_aula ?? null,
  };
}

export function computeSimuladoResumo(
  rows: SimuladoRespostaProgressRow[],
  totalQuestoes: number,
): SimuladoResumo {
  let respondidas = 0;
  let acertos = 0;
  let erros = 0;
  let tempoTotalMs = 0;

  for (const row of rows) {
    if (row.acertou === null) continue;
    respondidas += 1;
    if (row.acertou) acertos += 1;
    else erros += 1;
    tempoTotalMs += row.tempo_ms ?? 0;
  }

  const pendentes = totalQuestoes - respondidas;

  return {
    respondidas,
    pendentes,
    acertos,
    erros,
    percentual_acerto: respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0,
    tempo_total_ms: tempoTotalMs,
    tempo_medio_ms: respondidas > 0 ? Math.round(tempoTotalMs / respondidas) : 0,
  };
}

export function buildSimuladoQuestaoRespondida(
  row: SimuladoRespostaProgressRow,
  opts: { sessionMode: SimuladoModo; sessionStatus: SimuladoSessionStatus },
): SimuladoQuestaoRespondida {
  const hideGabarito = opts.sessionMode === 'prova' && opts.sessionStatus === 'aberto';

  return {
    ordem: row.ordem,
    modulo_slug: row.modulo_slug,
    respondida: true,
    meta: extractQuestaoMetaFromModulo(row.modulos_estudo),
    acertou: hideGabarito ? false : (row.acertou ?? false),
    opcao_id: row.opcao_id,
    opcao_correta_id: hideGabarito ? null : row.opcao_correta_id,
    respondida_em: row.respondida_em,
    tempo_ms: row.tempo_ms,
  };
}
