import { MeasuredWindowTelemetryCollector } from '@/lib/scale/authenticatedHarness/measuredWindowTelemetry';

describe('MeasuredWindowTelemetryCollector', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('separa janela autorizada e drain', () => {
    jest.useFakeTimers();
    const start = 1_000_000;
    jest.setSystemTime(start);
    const collector = new MeasuredWindowTelemetryCollector(start, 600);
    collector.markRequestStart();
    collector.markRequestEnd();
    jest.setSystemTime(start + 100);
    collector.markRequestStart();
    const report = collector.finalize(900);
    expect(report.authorized_window_ms).toBe(600);
    expect(report.wall_clock_measured_elapsed_ms).toBe(900);
    expect(report.drain_elapsed_ms).toBe(300);
    expect(report.request_starts_during_window).toBe(2);
  });

  it('conta completions na janela vs após janela e in-flight', () => {
    jest.useFakeTimers();
    const start = 0;
    jest.setSystemTime(start);
    const collector = new MeasuredWindowTelemetryCollector(start, 1_000);

    collector.markRequestStart();
    jest.setSystemTime(200);
    collector.markRequestEnd();

    jest.setSystemTime(900);
    collector.markRequestStart();
    jest.setSystemTime(1_500);
    collector.markRequestEnd();

    const report = collector.finalize(1_500);
    expect(report.request_completions_during_window).toBe(1);
    expect(report.request_completions_after_window).toBe(1);
    expect(report.in_flight_at_window_end).toBe(1);
    expect(report.drain_elapsed_ms).toBe(500);
  });

  it('calcula taxas de start e completion', () => {
    jest.useFakeTimers();
    const start = 0;
    jest.setSystemTime(start);
    const collector = new MeasuredWindowTelemetryCollector(start, 2_000);

    for (let i = 0; i < 4; i += 1) {
      collector.markRequestStart();
      jest.setSystemTime((i + 1) * 400);
      collector.markRequestEnd();
    }

    const report = collector.finalize(2_000);
    expect(report.request_starts_during_window).toBe(4);
    expect(report.request_completions_during_window).toBe(4);
    expect(report.request_start_rate_rps).toBe(2);
    expect(report.completion_rate_during_window_rps).toBe(2);
    expect(report.final_completion_rate_rps).toBe(2);
    expect(report.in_flight_at_window_end).toBe(0);
  });
});
