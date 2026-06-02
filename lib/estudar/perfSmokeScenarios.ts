import { readFileSync } from 'fs';
import { resolve } from 'path';
import { buildEstudarQuestaoPlayerPayload } from '@/lib/estudar/questaoPlayerPayload';
import { stripSlidesForCoreLayer } from '@/lib/estudar/questaoLayers';
import { stripQuestionAnswersForClient } from '@/lib/estudar/questionPayload';
import type { LessonData } from '@/types/lesson';

export type EstudarPayloadScenarioResult = {
  name: string;
  bytes: number;
  budgetBytes: number;
  failureCount: number;
};

/** Meta do plano: payload mediano `layers=core` &lt; 80 KB (corpo JSON; proxy gzip). */
const ESTUDAR_QUESTAO_CORE_BUDGET_BYTES = 80_000;

function jsonByteSize(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

function loadPremiumQuestaoFixture(): LessonData {
  const fixturePath = resolve(process.cwd(), 'examples/questao-premium-urgencias-rcp.json');
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as LessonData;
}

function runPayloadScenario(
  name: string,
  bytes: number,
  budgetBytes: number,
): EstudarPayloadScenarioResult {
  return {
    name,
    bytes,
    budgetBytes,
    failureCount: bytes > budgetBytes ? 1 : 0,
  };
}

/**
 * Payload típico de prefetch (`layers=core`): player props sem NeuroSlides.
 * Usa fixture premium (4 slides) para garantir que o core é bem menor que o full.
 */
export function runEstudarQuestaoCorePayloadScenario(): EstudarPayloadScenarioResult {
  const lesson = loadPremiumQuestaoFixture();
  const dadosCore = stripSlidesForCoreLayer(stripQuestionAnswersForClient(lesson));
  const payload = {
    dados: dadosCore,
    mode: 'live' as const,
    moduloSlug: 'questao-premium-urgencias-rcp',
    proximaSlug: null,
    anteriorSlug: null,
    questoesDoAssunto: [{ slug: 'questao-premium-urgencias-rcp', estudada: false }],
    fromPlano: false,
    vitrineQuerySuffix: '',
  };
  return runPayloadScenario(
    'estudar_questao_core',
    jsonByteSize(payload),
    ESTUDAR_QUESTAO_CORE_BUDGET_BYTES,
  );
}

export function runAllEstudarPayloadScenarios(): EstudarPayloadScenarioResult[] {
  return [runEstudarQuestaoCorePayloadScenario()];
}
