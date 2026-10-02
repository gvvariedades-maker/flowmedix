export type MeasuredWindowTelemetry = {
  authorized_window_ms: number;
  wall_clock_measured_elapsed_ms: number;
  drain_elapsed_ms: number;
  request_starts_during_window: number;
  request_completions_during_window: number;
  request_completions_after_window: number;
  in_flight_at_window_end: number;
  request_start_rate_rps: number;
  completion_rate_during_window_rps: number;
  final_completion_rate_rps: number;
};

export class MeasuredWindowTelemetryCollector {
  private readonly windowStartedAt: number;
  private readonly windowEndAt: number;
  private startsDuringWindow = 0;
  private completionsDuringWindow = 0;
  private completionsAfterWindow = 0;
  private inFlight = 0;
  private inFlightAtWindowEnd = 0;
  private windowEndCaptured = false;

  constructor(windowStartedAt: number, authorizedWindowMs: number) {
    this.windowStartedAt = windowStartedAt;
    this.windowEndAt = windowStartedAt + authorizedWindowMs;
  }

  markRequestStart(): void {
    const now = Date.now();
    if (now < this.windowEndAt) {
      this.startsDuringWindow += 1;
      this.inFlight += 1;
    }
  }

  markRequestEnd(): void {
    const now = Date.now();
    if (!this.windowEndCaptured && now >= this.windowEndAt) {
      this.windowEndCaptured = true;
      this.inFlightAtWindowEnd = this.inFlight;
    }
    if (this.inFlight > 0) this.inFlight -= 1;
    if (now < this.windowEndAt) {
      this.completionsDuringWindow += 1;
    } else {
      this.completionsAfterWindow += 1;
    }
  }

  finalize(wallClockMeasuredElapsedMs: number): MeasuredWindowTelemetry {
    const authorized_window_ms = this.windowEndAt - this.windowStartedAt;
    const drain_elapsed_ms = Math.max(0, wallClockMeasuredElapsedMs - authorized_window_ms);
    const windowSec = authorized_window_ms / 1000;
    const totalSec = wallClockMeasuredElapsedMs / 1000;
    const totalCompletions =
      this.completionsDuringWindow + this.completionsAfterWindow;
    return {
      authorized_window_ms,
      wall_clock_measured_elapsed_ms: wallClockMeasuredElapsedMs,
      drain_elapsed_ms,
      request_starts_during_window: this.startsDuringWindow,
      request_completions_during_window: this.completionsDuringWindow,
      request_completions_after_window: this.completionsAfterWindow,
      in_flight_at_window_end: this.inFlightAtWindowEnd,
      request_start_rate_rps: windowSec > 0 ? this.startsDuringWindow / windowSec : 0,
      completion_rate_during_window_rps:
        windowSec > 0 ? this.completionsDuringWindow / windowSec : 0,
      final_completion_rate_rps: totalSec > 0 ? totalCompletions / totalSec : 0,
    };
  }
}
