import { MeasuredWindowTelemetryCollector } from '@/lib/scale/authenticatedHarness/measuredWindowTelemetry';

describe('MeasuredWindowTelemetryCollector', () => {
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
    jest.useRealTimers();
    expect(report.authorized_window_ms).toBe(600);
    expect(report.wall_clock_measured_elapsed_ms).toBe(900);
    expect(report.drain_elapsed_ms).toBe(300);
    expect(report.request_starts_during_window).toBe(2);
  });
});
