# Harness determinism (local replay)

## Local E2E runner (Windows / replay determinístico)

O job **GitHub CI** continua usando apenas `npm run test:e2e` (Playwright `webServer`: `build && start`, timeout 300s). **Nada no workflow foi alterado.**

Para desenvolvimento local — especialmente **Windows**, onde build + start dentro do `webServer` estoura o budget — use:

```bash
npm run test:e2e:local
```

O runner (`scripts/run-e2e-local.ts`):

1. Monta **child env explícito** (não confia no shell pai): `CI=true`, bypass E2E funcional, placeholders públicos de CI, **`E2E_CAPTURE_MODE` ausente** (capture-only specs skipped).
2. Remove resíduos `PLAYWRIGHT_SKIP_WEBSERVER` / `PLAYWRIGHT_PROD` antes de montar os filhos.
3. Executa **`npm run build`** como etapa separada.
4. Sobe **`next start`** via `process.execPath` (porta default **3104**, override só via `E2E_LOCAL_PORT` — **`PORT` genérico do shell é ignorado**). **`assertPortFree`** antes do bind — não aceita servidor preexistente na porta.
5. Aguarda `/api/health` (**200 ou 503** = vivo).
6. Roda **`playwright test`** com `PLAYWRIGHT_SKIP_WEBSERVER=true` e exit code propagado.
7. Encerra **somente** o process tree do servidor que ele criou.

Capture-only (mutação de PNGs tracked):

Use os **entrypoints oficiais** (`npm run capture:*`) — eles definem `E2E_CAPTURE_MODE=true` no child env. Ou manualmente:

```bash
E2E_CAPTURE_MODE=true npx playwright test e2e/audit-visual-baseline.spec.ts --project=chromium --workers=1
```

Wrappers com capture mode integrado: `capture:t3-vitrine`, `capture:desempenho-hub`, `capture:hero-mockups`, `capture:questao-review`.

## P0 fixtures (line endings)

P0 evidence JSON under `__tests__/fixtures/p0-evidence/` is checked out with **LF** via `.gitattributes` so `candidate_file_sha256` matches Linux CI on Windows.

## Perf smoke (sanitized local runner)

Playwright `webServer` sets `E2E_DASHBOARD_BYPASS=true` for functional E2E. That must **not** leak into perf smoke.

```bash
npm run build   # CI placeholders — see .github/workflows/test.yml
npm run perf:smoke:local
```

`perf:smoke:local` removes `E2E_*_BYPASS` keys in child processes only. GitHub CI continues to use `npm run perf:smoke`.

- **`assertPortFree`** on `PERF_LOCAL_PORT` (default 3104) before `next start`.
- Falha se o child Next morrer antes do health (ex.: `EADDRINUSE`) — evita perf contra processo estrangeiro.
- **`METRICS_SECRET`** no child é sempre o placeholder CI (`ci_metrics_secret_placeholder`), nunca herdado do shell pai.

Negative test: parent shell may set `E2E_DASHBOARD_BYPASS=true`; child env must show `ABSENT`.

## E2E capture mode

Specs that write golden screenshots to **tracked** paths are **capture-only**. Default `npm run test:e2e` skips them.

Explicit capture:

```bash
npm run capture:hero-mockups
# ou
E2E_CAPTURE_MODE=true npx playwright test e2e/audit-visual-baseline.spec.ts --project=chromium --workers=1
```

`capture:questao-review` exige pelo menos um `.png` **novo ou modificado** após o Playwright (snapshot antes/depois) — PNG stale não conta. Wrappers removem `CI` herdado para evitar skip silencioso no spec.

Functional regression specs are unchanged. `visual-mold-regression` / `variant-gallery-regression` remain CI-skipped via existing `process.env.CI` guards.
