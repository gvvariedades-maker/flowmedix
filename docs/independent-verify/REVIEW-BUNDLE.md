# EWU-HARNESS-DETERMINISM-001 — Independent Verify Bundle (UTF-8)

BASE: ecb6d6810d2a36b1dc2af3df6c2f3c6d9145c2ff
HEAD: ecb6d6810d2a36b1dc2af3df6c2f3c6d9145c2ff
Generated: 2026-09-25T04:51:26.473Z
Encoding: UTF-8 (patches via git encoding=utf8)

## 1. git status --short
```
 M __tests__/fixtures/p0-evidence/P0-02_editorial_raw.json
 M e2e/audit-visual-baseline.spec.ts
 M e2e/audit-visual-editorial-v2.spec.ts
 M e2e/audit-visual-external.spec.ts
 M e2e/capture-desempenho-hub.spec.ts
 M e2e/capture-editorial-premium-after.spec.ts
 M e2e/capture-editorial-premium-before.spec.ts
 M e2e/capture-hero-mockups.spec.ts
 M e2e/capture-questao-review.spec.ts
 M e2e/capture-t3-vitrine.spec.ts
 M e2e/mobile-drawer.spec.ts
 M package.json
 M scripts/capture-desempenho-hub.ts
 M scripts/capture-questao-review.ts
 M scripts/capture-t3-vitrine.ts
?? .gitattributes
?? __tests__/lib/captureMode.test.ts
?? __tests__/lib/e2eLocalRunnerEnv.test.ts
?? __tests__/lib/harness/
?? __tests__/lib/perf/sanitizeHarnessEnv.test.ts
?? artifacts/EWU-HARNESS-DETERMINISM-001-full.patch
?? artifacts/EWU-HARNESS-DETERMINISM-001-implementation.patch
?? artifacts/EWU-HARNESS-DETERMINISM-001-p0-fixture.patch
?? artifacts/EWU-HARNESS-DETERMINISM-001-review-bundle.md
?? artifacts/desempenho-nav-wave1-timings.json
?? artifacts/e2e-server-3104.stderr.log
?? artifacts/e2e-server-3104.stdout.log
?? artifacts/harness-determinism-e2e.log
?? artifacts/harness-determinism-perf-local.log
?? artifacts/harness-determinism-unit.log
?? artifacts/perf-server-death-test.err.log
?? artifacts/perf-server-death-test.out.log
?? artifacts/perf-smoke-bypass-A.json
?? artifacts/perf-smoke-local-report.json
?? artifacts/repair1-build-cycle1.err.log
?? artifacts/repair1-build-cycle1.log
?? artifacts/repair1-build.log
?? artifacts/repair1-e2e-contract.txt
?? artifacts/repair1-e2e-run.err.log
?? artifacts/repair1-e2e-run.log
?? artifacts/repair1-npm-ci-normal.log
?? artifacts/repair1-server-monitor.log
?? artifacts/repair2-e2e-local-run.log
?? artifacts/repair2-e2e-local-run2.err.log
?? artifacts/repair2-e2e-local-run2.log
?? artifacts/repair2-perf-local.log
?? artifacts/repair2-tracked-before-e2e.txt
?? artifacts/repair3-before-full-e2e-local.txt
?? artifacts/repair3-d9-chromium-post-x20.log
?? artifacts/repair3-d9-chromium-post2-x20.log
?? artifacts/repair3-d9-chromium-x20-v2.log
?? artifacts/repair3-d9-chromium-x20.err.log
?? artifacts/repair3-d9-chromium-x20.log
?? artifacts/repair3-d9-mobile-post-x20.log
?? artifacts/repair3-d9-mobile-post2-x20.log
?? artifacts/repair3-d9-mobile-x10.log
?? artifacts/repair3-full-e2e-local.err.log
?? artifacts/repair3-full-e2e-local.log
?? artifacts/repair3-proof-d9-chromium-x20.log
?? artifacts/repair3-proof-d9-mobile-x20.log
?? artifacts/repair3-proof-exits.txt
?? artifacts/repair3-proof-serial-chromium-x5.log
?? artifacts/repair3-proof-serial-mobile-x5.log
?? artifacts/repair3-proof-server.pid
?? artifacts/repair3-serial-chromium-post-x5.log
?? artifacts/repair3-serial-mobile-post-x5.log
?? artifacts/repair3-serial-mobile-x5.log
?? artifacts/repair3-server.pid
?? artifacts/repair3-server.stderr.log
?? artifacts/repair3-server.stdout.log
?? artifacts/repair3-tracked-before-full-e2e.txt
?? artifacts/synthetic-catalog-10k.json
?? artifacts/tracked-before-e2e.txt
?? docs/HARNESS_DETERMINISM.md
?? docs/independent-verify/
?? e2e/helpers/captureModeGate.ts
?? lib/e2e/captureMode.ts
?? lib/e2e/localRunnerEnv.ts
?? lib/harness/
?? lib/perf/sanitizeHarnessEnv.ts
?? scripts/capture-hero-mockups.ts
?? scripts/run-e2e-local.ts
?? scripts/run-perf-smoke-local.ts
?? scripts/write-independent-verify-bundle.ts
```

## 2. git diff --check
```
(clean)
```

## 3. git diff --stat
```
e2e/audit-visual-baseline.spec.ts            |  7 +++++-
 e2e/audit-visual-editorial-v2.spec.ts        |  9 +++++--
 e2e/audit-visual-external.spec.ts            | 11 ++++++---
 e2e/capture-desempenho-hub.spec.ts           |  5 ++++
 e2e/capture-editorial-premium-after.spec.ts  |  7 +++++-
 e2e/capture-editorial-premium-before.spec.ts |  7 +++++-
 e2e/capture-hero-mockups.spec.ts             |  5 ++++
 e2e/capture-questao-review.spec.ts           |  5 ++++
 e2e/capture-t3-vitrine.spec.ts               |  5 ++++
 e2e/mobile-drawer.spec.ts                    | 35 +++++++++++++++++++++++++---
 package.json                                 |  4 +++-
 scripts/capture-desempenho-hub.ts            |  6 +++--
 scripts/capture-questao-review.ts            | 30 ++++++++++++++++--------
 scripts/capture-t3-vitrine.ts                |  6 +++--
 14 files changed, 116 insertions(+), 26 deletions(-)
```

## 4. git diff --name-status
```
M	e2e/audit-visual-baseline.spec.ts
M	e2e/audit-visual-editorial-v2.spec.ts
M	e2e/audit-visual-external.spec.ts
M	e2e/capture-desempenho-hub.spec.ts
M	e2e/capture-editorial-premium-after.spec.ts
M	e2e/capture-editorial-premium-before.spec.ts
M	e2e/capture-hero-mockups.spec.ts
M	e2e/capture-questao-review.spec.ts
M	e2e/capture-t3-vitrine.spec.ts
M	e2e/mobile-drawer.spec.ts
M	package.json
M	scripts/capture-desempenho-hub.ts
M	scripts/capture-questao-review.ts
M	scripts/capture-t3-vitrine.ts
```

## 5–8. See implementation.patch, NEW-IMPLEMENTATION-FILES.md, package.json.patch, mobile-drawer.spec.patch

D9 note: `expect(...).toPass()` uses Playwright built-in retry (PLAYWRIGHT_TO_PASS_RETRY=YES); CUSTOM_RETRY_LOOP=NO.
