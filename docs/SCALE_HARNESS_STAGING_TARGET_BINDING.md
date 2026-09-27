# Staging target binding — harness EWU-SCALE-1K

Decisão **2026-09-27**: alvos versionados para pools e futura autorização de load test (ainda **sem** `LOAD_TEST_AUTHORIZATION`).

## Hosts canônicos

| Papel | Host | Git / infra |
| --- | --- | --- |
| **App staging** | `flowmedix-git-staging-gvvariedades-makers-projects.vercel.app` | Branch Git `staging` → Vercel Preview (alias estável) |
| **Supabase staging** | `higsjzfigprqvldpxfwj.supabase.co` | Projeto CAS/RC-004 (clone DR com schema AVANT) |
| **Local dev** | `127.0.0.1`, `localhost` | Pools locais / plano apenas |

**Excluído da allowlist:** `avant.enf.br`, `www.avant.enf.br`, `ozgouenqrofnvgrlgfwd.supabase.co` (Production).

Fonte versionada: [`data/scale-harness/staging-target.allowlist.json`](../data/scale-harness/staging-target.allowlist.json).

## Operações já feitas

1. `origin/staging` sincronizado com `main` (`d1fe4a28`) — deploy Vercel **READY** no alias acima.
2. Vercel Preview **branch `staging`**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` apontando para `higsjz` (não ozgouen).

## Pendência manual (Owner / ops)

1. **`SUPABASE_SERVICE_ROLE_KEY`** na Vercel (Preview, branch `staging`) — copiar do dashboard do projeto `higsjzfigprqvldpxfwj` (não commitar). Sem isso, rotas server-side/admin do preview podem falhar.
2. **Deployment Protection** na Vercel: se `/api/*` exigir bypass, usar `VERCEL_PROTECTION_BYPASS` no pool/harness conforme runbook perf.
3. **Supabase Branching** no projeto Production (`ozgouen`): plano atual retorna `402` (Pro). Até upgrade, o data plane de ensaio permanece o projeto CAS.

## Pool (gitignored)

Exemplo: [`examples/scale-harness-pool.example.json`](../examples/scale-harness-pool.example.json)

```text
base_url: https://flowmedix-git-staging-gvvariedades-makers-projects.vercel.app
supabase_url: https://higsjzfigprqvldpxfwj.supabase.co
```

Credenciais sintéticas: provisionar usuários de teste **somente** no projeto `higsjz`.

## Próximo gate

Após CI no SHA que altera a allowlist: `STAGING_TARGET_BOUND` + digests novos na futura env de escopo (`SCALE_HARNESS_AUTHORIZED_ALLOWLIST_SHA256`, `APP_HOST`, `SUPABASE_HOST`).
