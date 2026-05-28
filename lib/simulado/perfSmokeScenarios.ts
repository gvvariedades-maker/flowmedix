import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildSimuladoSessionDetail } from '@/lib/simulado/sessionDetail';
import type { SimuladoRespostaProgressRow, SimuladoSessionDbRow } from '@/lib/simulado/sessionDetail';
import { stripQuestionForSimulado } from '@/lib/estudar/questionPayload';
import type { SimuladoAnswerResponse } from '@/lib/simulado/types';

export type PayloadScenarioResult = {
  name: string;
  bytes: number;
  budgetBytes: number;
  failureCount: number;
};

const SESSION_50_BUDGET_BYTES = 80_000;
const QUESTAO_SLIM_BUDGET_BYTES = 5_000;
const RESPONDER_PATCH_BUDGET_BYTES = 4_000;

function jsonByteSize(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

function buildSyntheticSession50Rows(): SimuladoRespostaProgressRow[] {
  return Array.from({ length: 50 }, (_, index) => ({
    ordem: index + 1,
    modulo_slug: `q-sim-perf-${String(index + 1).padStart(3, '0')}`,
    opcao_id: null,
    opcao_correta_id: null,
    acertou: null,
    respondida_em: null,
    tempo_ms: null,
    modulos_estudo: {
      banca: 'FGV',
      titulo_aula: 'Urgências e Emergências',
      modulo_nome: 'Enfermagem',
    },
  }));
}

const SYNTHETIC_SESSION_ROW: SimuladoSessionDbRow = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  status: 'aberto',
  total_questoes: 50,
  filtros: { modo: 'treino', perf: true },
  created_at: '2026-05-28T00:00:00.000Z',
  concluida_em: null,
};

function loadPremiumQuestaoFixture(): Record<string, unknown> {
  const fixturePath = resolve(process.cwd(), 'examples/questao-premium-urgencias-rcp.json');
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as Record<string, unknown>;
}

function buildSyntheticResponderPatch(): SimuladoAnswerResponse {
  return {
    success: true,
    acertou: true,
    opcao_correta_id: 'B',
    session_status: 'aberto',
    questao_atualizada: {
      ordem: 25,
      modulo_slug: 'q-sim-perf-025',
      respondida: true,
      meta: {
        banca: 'FGV',
        topico: 'Enfermagem',
        subtopico: 'Urgências e Emergências',
      },
      acertou: true,
      opcao_id: 'B',
      opcao_correta_id: 'B',
      respondida_em: '2026-05-28T12:00:00.000Z',
      tempo_ms: 42_000,
    },
    resumo: {
      respondidas: 25,
      pendentes: 25,
      acertos: 20,
      erros: 5,
      percentual_acerto: 80,
      tempo_total_ms: 900_000,
      tempo_medio_ms: 36_000,
    },
  };
}

function runPayloadScenario(
  name: string,
  bytes: number,
  budgetBytes: number,
): PayloadScenarioResult {
  return {
    name,
    bytes,
    budgetBytes,
    failureCount: bytes > budgetBytes ? 1 : 0,
  };
}

/** Payload de sessão com 50 questões (sem conteudo_json). Meta: &lt; 80 KB. */
export function runSimuladoSession50PayloadScenario(): PayloadScenarioResult {
  const detail = buildSimuladoSessionDetail(SYNTHETIC_SESSION_ROW, buildSyntheticSession50Rows());
  return runPayloadScenario('simulado_session_50', jsonByteSize(detail), SESSION_50_BUDGET_BYTES);
}

/** Questão slim para o runner (sem NeuroSlides). Meta: &lt; 5 KB. */
export function runSimuladoQuestaoSlimPayloadScenario(): PayloadScenarioResult {
  const slim = stripQuestionForSimulado(loadPremiumQuestaoFixture() as Parameters<typeof stripQuestionForSimulado>[0]);
  const payload = { dados: slim };
  return runPayloadScenario('simulado_questao_slim', jsonByteSize(payload), QUESTAO_SLIM_BUDGET_BYTES);
}

/** Resposta incremental do POST responder. Meta: &lt; 4 KB. */
export function runSimuladoResponderPatchScenario(): PayloadScenarioResult {
  const patch = buildSyntheticResponderPatch();
  return runPayloadScenario('simulado_responder_patch', jsonByteSize(patch), RESPONDER_PATCH_BUDGET_BYTES);
}

export function runAllSimuladoPayloadScenarios(): PayloadScenarioResult[] {
  return [
    runSimuladoSession50PayloadScenario(),
    runSimuladoQuestaoSlimPayloadScenario(),
    runSimuladoResponderPatchScenario(),
  ];
}
