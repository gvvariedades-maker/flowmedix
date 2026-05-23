import {
  evaluateScaleAlerts,
  parseScaleHealthRpcPayload,
  type ScaleHealthDbMetrics,
} from '@/lib/scale/healthCheck';
import { SCALE_LIMITS } from '@/lib/scale/constants';

function baseMetrics(overrides: Partial<ScaleHealthDbMetrics> = {}): ScaleHealthDbMetrics {
  return {
    generated_at: '2026-05-24T12:00:00Z',
    modulos_estudo_count: 100,
    historico_questoes_count: 1000,
    json_bytes: { avg: 10_000, max: 30_000, p95: 25_000, total: 1_000_000 },
    questions_over_100kb: 0,
    assuntos_over_200_count: 0,
    users_historico_over_5000: 0,
    reverse_slides: { avg: 4, not_four_slides: 0 },
    ...overrides,
  };
}

describe('parseScaleHealthRpcPayload', () => {
  it('normaliza payload da RPC', () => {
    const parsed = parseScaleHealthRpcPayload({
      modulos_estudo_count: 42,
      historico_questoes_count: '99',
      json_bytes: { avg: 1, max: 2, p95: 3, total: 4 },
      reverse_slides: { avg: 4, not_four_slides: 1 },
    });

    expect(parsed?.modulos_estudo_count).toBe(42);
    expect(parsed?.historico_questoes_count).toBe(99);
    expect(parsed?.json_bytes.p95).toBe(3);
    expect(parsed?.reverse_slides.not_four_slides).toBe(1);
  });
});

describe('evaluateScaleAlerts', () => {
  it('retorna SCALE_OK quando abaixo dos tetos', () => {
    const alerts = evaluateScaleAlerts(baseMetrics());
    expect(alerts.some((a) => a.code === 'SCALE_OK')).toBe(true);
  });

  it('alerta crítico no teto da vitrine', () => {
    const alerts = evaluateScaleAlerts(
      baseMetrics({ modulos_estudo_count: SCALE_LIMITS.VITRINE_MODULOS }),
    );
    expect(alerts.some((a) => a.code === 'CATALOG_AT_VITRINE_CAP')).toBe(true);
  });

  it('alerta assuntos com mais de 200 questões', () => {
    const alerts = evaluateScaleAlerts(baseMetrics({ assuntos_over_200_count: 2 }));
    expect(alerts.some((a) => a.code === 'ASSUNTOS_OVER_NAV_LIMIT')).toBe(true);
  });

  it('alerta JSON muito pesado', () => {
    const alerts = evaluateScaleAlerts(
      baseMetrics({
        json_bytes: { avg: 50_000, max: 250_000, p95: 80_000, total: 0 },
        questions_over_100kb: 3,
      }),
    );
    expect(alerts.some((a) => a.code === 'JSON_PAYLOAD_VERY_HEAVY')).toBe(true);
    expect(alerts.some((a) => a.code === 'JSON_P95_HIGH')).toBe(true);
  });

  it('alerta usuários com histórico acima do cap de leitura', () => {
    const alerts = evaluateScaleAlerts(baseMetrics({ users_historico_over_5000: 1 }));
    expect(alerts.some((a) => a.code === 'USERS_OVER_HISTORICO_CAP')).toBe(true);
  });
});
